"use client";

import { useParams } from "next/navigation";

export default function OrderDetailsPage() {
  const params = useParams();

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Order #{params.id}</h1>
          <p>Order details and management</p>
        </div>
      </div>

      <div className="details-grid">
        <div className="admin-card">
          <h3>Customer Information</h3>

          <div className="detail-list">
            <div>
              <span>Name</span>
              <strong>Chamodi Jayasingha</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>customer@example.com</strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>0771234567</strong>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3>Order Status</h3>

          <select className="admin-select full-width">
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>

        <div className="admin-card full-card">
          <h3>Order Items</h3>

          <div className="order-product">
            <div className="product-placeholder">
              P
            </div>

            <div>
              <strong>
                Premium Cotton T-Shirt
              </strong>

              <span>
                Size: M | Color: Black
              </span>
            </div>

            <strong>
              Rs. 4,500
            </strong>
          </div>

          <div className="order-total">
            <span>Total</span>
            <strong>Rs. 4,500</strong>
          </div>
        </div>
      </div>
    </div>
  );
}