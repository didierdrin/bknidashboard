import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { firestore as db } from "../../firebaseApp";
import { getAuth } from "firebase/auth";
interface Order {
  id: string;
  order_id: number;
  customer_info: {
    name: string;
    email: string;
    phone: string;
  };
  total_amount: number;
  order_date: {
    toDate: () => Date;
  };
  order_status: string[];
  shipping_address: {
    unit_number: string;
    street_address: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    special_instructions?: string;
  };
  items: Array<{
    name: string;
    price_per_unit: number;
    quantity: number;
  }>;
  payment_method: string;
  tracking_number: {
    toDate: () => Date;
  };
  actual_delivery_date: {
    toDate: () => Date;
  } | null;
}

const RecentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const auth = getAuth();
  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No user logged in");
      return;
    }
    const q = query(collection(db, "recent_orders"),where("brand_uid", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, "id">),
      }));
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, []);

  const formatAddress = (order: Order) => {
    const a = order.shipping_address;
    if (!a) return '—';
    return `${a.unit_number}, ${a.street_address}, ${a.city}, ${a.province}, ${a.postal_code}, ${a.country}`;
  };

  return (
    <div className="dashboard-card">
      <h3 className="text-lg sm:text-xl font-semibold mb-4">Recent Orders</h3>

      {/* Mobile card list */}
      <div className="space-y-4 md:hidden">
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No recent orders.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-gray-200 p-4 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-700/40">
              <div className="flex justify-between gap-2 mb-2">
                <span className="font-semibold">#{order.order_id}</span>
                <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-600">
                  {order.order_status[order.order_status.length - 1]}
                </span>
              </div>
              <p className="font-medium">{order.customer_info.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{order.customer_info.email}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{order.customer_info.phone}</p>
              <p className="mt-2 font-medium">RWF {order.total_amount}</p>
              <p className="text-xs text-gray-500 mt-1">
                Ordered: {new Date(order.order_date.toDate()).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                Payment: {order.payment_method}
              </p>
              <div className="mt-2 border-t pt-2">
                <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Items</p>
                {order.items?.map((item, index) => (
                  <p key={index} className="text-xs text-gray-600 dark:text-gray-300">
                    {item.name} — {item.quantity} × RWF{item.price_per_unit}
                  </p>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Delivered:{' '}
                {order.actual_delivery_date
                  ? new Date(order.actual_delivery_date.toDate()).toLocaleDateString()
                  : 'Not yet'}
              </p>
              <p className="mt-1 break-words text-xs text-gray-600 dark:text-gray-300">{formatAddress(order)}</p>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="px-4 py-2 text-left whitespace-nowrap">Order ID</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Items</th>
              <th className="px-4 py-2 text-left">Payment</th>
              <th className="px-4 py-2 text-left">Tracking</th>
              <th className="px-4 py-2 text-left">Delivery</th>
              <th className="px-4 py-2 text-left">Address</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2">{order.order_id}</td>
                <td className="px-4 py-2">
                  {order.customer_info.name} <br />
                  {order.customer_info.email} <br />
                  {order.customer_info.phone}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">RWF{order.total_amount}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {new Date(order.order_date.toDate()).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {order.order_status[order.order_status.length - 1]}
                </td>
                <td className="px-4 py-2">
                  {order.items?.map((item, index) => (
                    <div key={index}>
                      {item.name} - {item.quantity} x RWF{item.price_per_unit}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-2">{order.payment_method}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {order.tracking_number
                    ? new Date(order.tracking_number.toDate()).toLocaleDateString()
                    : '—'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {order.actual_delivery_date
                    ? new Date(order.actual_delivery_date.toDate()).toLocaleDateString()
                    : "Not Delivered Yet"}
                </td>
                <td className="px-4 py-2 max-w-xs">
                  {order.shipping_address && (
                    <>
                      {order.shipping_address.unit_number}, {order.shipping_address.street_address},<br />
                      {order.shipping_address.city}, {order.shipping_address.province},<br />
                      {order.shipping_address.postal_code}, {order.shipping_address.country}<br />
                      {order.shipping_address.special_instructions && (
                        <em>Instructions: {order.shipping_address.special_instructions}</em>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
