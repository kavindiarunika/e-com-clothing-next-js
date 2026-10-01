
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">

      <header className="bg-[#322D29]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-[0.25em] text-[#EFE9E1]"
          >
            VELORA
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#EFE9E1] hover:text-[#AC9C8D]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-16">

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#72383D]">
            VELORA
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            Terms & Conditions
          </h1>
        </div>

        <article className="mt-12 space-y-8 rounded-3xl bg-white p-7 shadow-sm sm:p-10">

          <Section title="1. Website Use">
            By using the VELORA website, you agree to use the website
            responsibly and in accordance with applicable laws.
          </Section>

          <Section title="2. Products">
            Product information, images, prices, availability, sizes, and
            colors are displayed to help customers make purchasing decisions.
            Product availability may change.
          </Section>

          <Section title="3. Orders">
            Customers are responsible for providing accurate information
            when placing an order. VELORA may contact customers regarding
            order confirmation and delivery.
          </Section>

          <Section title="4. Payment">
            VELORA currently supports Cash on Delivery for customer orders.
            Payment details and order status are displayed according to the
            order information available in the system.
          </Section>

          <Section title="5. Returns & Exchanges">
            Returns and exchanges are subject to the applicable VELORA
            return and exchange conditions. Customers can submit eligible
            requests through their account.
          </Section>

          <Section title="6. Account">
            Customers are responsible for maintaining the security and
            accuracy of their account information.
          </Section>

          <Section title="7. Changes">
            VELORA may update website content, policies, products, and
            services when necessary.
          </Section>

          <Section title="8. Contact">
            If you have questions about these Terms & Conditions, please
            contact VELORA through our Contact Us page.
          </Section>

        </article>
      </section>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-7 text-[#322D29]/65">
        {children}
      </p>
    </section>
  );
}

