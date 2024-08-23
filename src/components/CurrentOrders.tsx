import { useState, useEffect } from "react";
import {
  getFirestore,
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

interface Order {
  id: string;
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
}

const CurrentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("order_status", "array-contains-any", ["Processing", "Shipped"])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, 'id'>),
      }));
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, []);

  // Function to handle updating the order status
  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    const orderDocRef = doc(db, "orders", order.id);

    try {
      // Update the order's status to "Delivered"
      if (newStatus === "Delivered") {
        // Move the order to the global recent_orders collection
        const addedOrderRef = await addDoc(collection(db, "recent_orders"), {
          ...order,
          order_status: ["Delivered"],
          actual_delivery_date: new Date(),
        });

        // Fetch the newly added order from the recent_orders collection
        const recentOrderSnapshot = await getDocs(
          query(collection(db, "recent_orders"), where("__name__", "==", addedOrderRef.id))
        );

        recentOrderSnapshot.forEach(async (doc) => {
          const orderData = doc.data();

          // Assuming client_uid is part of the order data (e.g., orderData.client_uid or orderData.customer_info.uid)
          const clientUid = orderData.customer_info?.uid;
          if (clientUid) {
            // Add the order to the specific user's recent_orders collection
            const userOrderRef = collection(db, "users", clientUid, "recent_orders");

            await addDoc(userOrderRef, {
              items: orderData.items || [], // Assuming items are part of the order data
              totalAmount: orderData.total_amount,
              orderDate: new Date(orderData.order_date.toDate()), // Convert order_date back to Date
              status: "Delivered",
              actual_delivery_date: new Date(),
            });
          }
        });

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Current Orders</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Total Amount</th>
              <th className="px-4 py-2">Order Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="px-4 py-2">{order.order_id}</td>
                <td className="px-4 py-2">{order.customer_info.name}</td>
                <td className="px-4 py-2">RWF{order.total_amount}</td>
                <td className="px-4 py-2">
                  {new Date(order.order_date.toDate()).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {order.order_status[order.order_status.length - 1]}
                </td>
                <td className="px-4 py-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
                    onClick={() => handleUpdateStatus(order, "Delivered")}
                  >
                    Mark as Delivered
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded ml-2"
                    onClick={() => handleUpdateStatus(order, "Cancelled")}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrentOrders;
