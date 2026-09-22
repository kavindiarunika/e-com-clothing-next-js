"use client";

import { useState } from "react";

export default function CouponForm({
  initialData = {},
  onSubmit,
}) {
  const [form, setForm] = useState({
    code: initialData.code || "",
    discount:
      initialData.discount || "",
    discount_type:
      initialData.discount_type ||
      "percentage",
    minimum_amount:
      initialData.minimum_amount || "",
    maximum_discount:
      initialData.maximum_discount || "",
  });

  function change(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function submit(e) {
    e.preventDefault();

    onSubmit(form);
  }

  return (
    <form
      className="admin-form"
      onSubmit={submit}
    >
      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label>Coupon Code</label>

          <input
            name="code"
            value={form.code}
            onChange={change}
            placeholder="SAVE20"
            required
          />
        </div>

        <div className="admin-form-group">
          <label>Discount</label>

          <input
            type="number"
            name="discount"
            value={form.discount}
            onChange={change}
          />
        </div>

        <div className="admin-form-group">
          <label>Discount Type</label>

          <select
            name="discount_type"
            value={form.discount_type}
            onChange={change}
          >
            <option value="percentage">
              Percentage
            </option>

            <option value="fixed">
              Fixed Amount
            </option>
          </select>
        </div>

        <div className="admin-form-group">
          <label>Minimum Amount</label>

          <input
            type="number"
            name="minimum_amount"
            value={form.minimum_amount}
            onChange={change}
          />
        </div>

        <div className="admin-form-group">
          <label>Maximum Discount</label>

          <input
            type="number"
            name="maximum_discount"
            value={form.maximum_discount}
            onChange={change}
          />
        </div>
      </div>

      <button className="admin-button primary">
        Save Coupon
      </button>
    </form>
  );
}