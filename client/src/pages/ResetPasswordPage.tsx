import { useParams } from "@tanstack/react-router";
import { ResetPasswordForm } from "@/components/resetpassword-form";
import { Helmet } from "react-helmet";

export default function ResetPasswordPage() {
  const { token } = useParams({ from: "/reset-password/$token" });

  if (!token) {
    return (
      <div className="text-center text-red-500">
        <p>The reset token is missing or invalid.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <Helmet>
        <meta charSet="utf-8" />
        <title>GoofyChain - Reset Password</title>
        <meta
          name="description"
          content="GoofyChain is the best platform to view transactions and Ethereum prices."
        />
        <meta
          name="keywords"
          content="GoofyChain, Ethereum, Transactions, Prices"
        />
        <link rel="icon" type="image/svg+xml" href="/logo.png" />
      </Helmet>
      <div className="w-full max-w-sm">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
