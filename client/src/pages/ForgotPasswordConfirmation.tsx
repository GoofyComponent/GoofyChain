import { Helmet } from "react-helmet";
import { Link } from "@tanstack/react-router";
import HyperText from "@/components/ui/hyper-text";

import logo from "@/assets/img/logo.png";

export default function ForgotPasswordConfirmationPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <Helmet>
        <meta charSet="utf-8" />
        <title>GoofyChain - Forgot Password</title>
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
      <div className="flex flex-col items-center gap-2">
        <Link to="/" className="flex flex-col items-center gap-2 font-medium">
          <div className="flex h-10 w-10 items-center justify-center rounded-md">
            <img src={logo} className="h-10 select-none" />
          </div>
          <span className="sr-only">GoofyChain</span>
        </Link>
        <HyperText
          className="text-5xl font-bold select-none"
          animateOnHover={false}
        >
          GoofyChain
        </HyperText>

        <div className="text-center text-sm mt-4">
          If your email address is valid, you will receive an email to reset
          your password.
          <div className="mt-4">
            <Link to="/login" className="underline underline-offset-4">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
