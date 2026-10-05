This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The development command starts the custom Node.js server that hosts both Next.js and the authenticated Socket.IO connection.

## Production

Build and run the app with:

```bash
npm run build
npm start
```

Velora uses Socket.IO for live order events (new orders and order/payment status changes) in customer and admin order views. Deploy it on a persistent Node.js server; serverless hosting and Next.js standalone output are not compatible with this custom server.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment details

This custom server requires a persistent Node.js host and is not compatible with Vercel serverless deployment.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
