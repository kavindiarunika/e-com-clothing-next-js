"use client";

import AdminCrudPage from "@/components/admin/AdminCrudPage";

export default function PaymentsPage() {
  return (
    <AdminCrudPage
      title="Payments"
      description="Monitor customer payments."
      addLabel="Add Payment"
      fields={[
        {
          key: "transaction_id",
          label: "Transaction ID",
        },
        {
          key: "order_id",
          label: "Order",
        },
        {
          key: "amount",
          label: "Amount",
        },
        {
          key: "payment_method",
          label: "Method",
        },
        {
          key: "payment_status",
          label: "Status",
        },
      ]}
      initialData={[
        {
          id: 1,
          transaction: "TXN-1001",
          order: "#ORD-1001",
          amount: "Rs. 12,500",
          method: "Card",
          status: "Paid",
        },
        {
          id: 2,
          transaction: "TXN-1002",
          order: "#ORD-1002",
          amount: "Rs. 8,900",
          method: "Cash",
          status: "Pending",
        },
      ]}
      endpoint="/api/admin/payments"
      resultKey="payments"
      idKey="payment_id"
      readOnly
    />
  );
}