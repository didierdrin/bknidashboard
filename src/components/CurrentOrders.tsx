import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { firestore as db } from "../../firebaseApp";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { getAuth } from "firebase/auth";

interface Order {
  id: string;
  client_uid: string;
  order_id: string;
  customer_info: {
    name: string;
    uid: string; // Assuming client_uid is stored here
  };
  total_amount: number;
  order_date: {
    toDate: () => Date;
  };
  order_status: string[];
  shipping_address?: {
    unit_number: string;
    street_address: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    special_instructions?: string;
  };
}

const CurrentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const auth = getAuth();
  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No user logged in");
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("order_status", "array-contains-any", ["Processing", "Shipped"]),
      where("brand_uid", "==", currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, "id">),
      }));
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, []);

  // Function to handle updating the order status
  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    const orderDocRef = doc(db, "orders", order.id);

    try {
      if (newStatus === "Delivered") {
        // Add order to the global recent_orders collection
        const addedOrderRef = await addDoc(collection(db, "recent_orders"), {
          ...order,
          order_status: ["Delivered"],
          actual_delivery_date: new Date(),
        });

        const clientUid = order.client_uid;

          if (clientUid) {
            // Add the order to the specific user's recent_orders subcollection
            const userOrderRef = collection(db, "users", clientUid, "recent_orders");

            await addDoc(userOrderRef, {
              items: order || [],
              totalAmount: order.total_amount,
              orderDate: new Date(order.order_date.toDate()),
              status: "Delivered",
              actual_delivery_date: new Date(),
              shipping_address: order.shipping_address || {}, // Ensure shipping address is included
            });
          }

        // Delete the order from the orders collection
        await deleteDoc(orderDocRef);
      } else {
        // Update the order status in the orders collection
        await updateDoc(orderDocRef, {
          order_status: [...order.order_status, newStatus],
        });
      }
    } catch (error) {
      console.error("Error updating order status: ", error);
    }
  };

  // Function to handle opening the dialog with shipping address details
  const handleOpenDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  // Function to handle closing the dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="dashboard-card">
      <h3 className="text-lg sm:text-xl font-semibold mb-4">Current Orders</h3>

      {/* Mobile card list */}
      <div className="space-y-4 md:hidden">
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No current orders.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border border-gray-200 p-4 shadow-sm dark:border-gray-600 dark:bg-gray-700/40"
              onClick={() => handleOpenDialog(order)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenDialog(order)}
            >
              <div className="flex justify-between gap-2 mb-2">
                <span className="font-semibold text-sm">#{order.order_id}</span>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-600">
                  {order.order_status[order.order_status.length - 1]}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200">{order.customer_info.name}</p>
              <p className="text-sm font-medium mt-1">RWF {order.total_amount}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(order.order_date.toDate()).toLocaleDateString()}
              </p>
              <div className="flex flex-col gap-2 mt-3 sm:flex-row">
                <button
                  type="button"
                  className="flex-1 bg-blue-500 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(order, "Delivered");
                  }}
                >
                  Mark as Delivered
                </button>
                <button
                  type="button"
                  className="flex-1 bg-red-500 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(order, "Cancelled");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="px-4 py-2 text-left">Order ID</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Total Amount</th>
              <th className="px-4 py-2 text-left">Order Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="cursor-pointer border-b border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700/50" onClick={() => handleOpenDialog(order)}>
                <td className="px-4 py-2">{order.order_id}</td>
                <td className="px-4 py-2">{order.customer_info.name}</td>
                <td className="px-4 py-2">RWF{order.total_amount}</td>
                <td className="px-4 py-2">
                  {new Date(order.order_date.toDate()).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {order.order_status[order.order_status.length - 1]}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(order, "Delivered");
                    }}
                  >
                    Delivered
                  </button>
                  <button
                    type="button"
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded ml-2 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(order, "Cancelled");
                    }}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <Dialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { m: { xs: 1, sm: 2 } } }}
        >
          <DialogTitle>Shipping Address</DialogTitle>
          <DialogContent>
            {selectedOrder.shipping_address ? (
              <div>
                <p>Unit Number: {selectedOrder.shipping_address.unit_number}</p>
                <p>Street Address: {selectedOrder.shipping_address.street_address}</p>
                <p>City: {selectedOrder.shipping_address.city}</p>
                <p>Province: {selectedOrder.shipping_address.province}</p>
                <p>Postal Code: {selectedOrder.shipping_address.postal_code}</p>
                <p>Country: {selectedOrder.shipping_address.country}</p>
                {selectedOrder.shipping_address.special_instructions && (
                  <p>Special Instructions: {selectedOrder.shipping_address.special_instructions}</p>
                )}
              </div>
            ) : (
              <p>No shipping address available.</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default CurrentOrders;
