import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ShinyButton from "@/components/ui/shiny-button";
import { TextAnimate } from "@/components/ui/text-animate";
import TypingAnimation from "@/components/ui/typing-animation";
import useAuth from "@/hooks/useAuth";
import { supportedCurrenciesEnum } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { LoaderCircle, PartyPopper } from "lucide-react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  currency: z.enum(supportedCurrenciesEnum),
});

const API_URL = import.meta.env.VITE_API_URL;

export const PreferedCurrencyPage = () => {
  const { accessToken, logout, update } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: "eur",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const finishOnboardingCall = await fetch(
      `${API_URL}/auth/profile/onboarding-completed`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          walletId: location?.state?.onboardings?.walletKey ?? "",
          preferedCurrency: values.currency,
        }),
      }
    );

    if (!finishOnboardingCall.ok) {
      const error = await finishOnboardingCall.json();
      if (!Array.isArray(error.message)) {
        error.message = [error.message];
      }

      if (error.message[0] === "Unauthorized") {
        await logout();

        return navigate({
          to: "/login",
        });
      }

      form.setError("currency", {
        type: "server",
        message: error.message.join(", "),
      });

      return;
    }

    await update({
      preferedCurrency: values.currency,
      initialWalletId: location?.state?.onboardings?.walletKey,
      isOnboarded: true,
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    navigate({
      to: "/dashboard/summary",
    });
  };

  return (
    <div className="flex min-h-[calc(90svh-4rem)] w-full items-center justify-center">
      <Helmet>
        <meta charSet="utf-8" />
        <title>GoofyChain - Onboarding - Prefered Currency</title>
        <meta
          name="description"
          content="GoofyChain is the best platform to view transactions and Ethereum prices."
        />
        <meta
          name="keywords"
          content="GoofyChain, Ethereum, Transactions, Prices"
        />
        <link rel="icon" type="image/svgxml" href="/logo.png" />
      </Helmet>
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <div className="flex justify-center gap-1 mt-4 mx-4">
              <div className="w-1/2 bg-slate-50 rounded-xl h-2 opacity-50"></div>
              <div className="w-1/2 bg-slate-50 rounded-xl h-2 "></div>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">
                <TypingAnimation>One last step !</TypingAnimation>
              </CardTitle>
              <CardDescription>
                <TextAnimate animation="blurInUp" by="character" delay={1000}>
                  Choose your prefered currency
                </TextAnimate>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-6">
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem className="grid gap-2">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {supportedCurrenciesEnum.map((currency) => (
                                <SelectItem key={currency} value={currency}>
                                  {currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <ShinyButton
                      type="submit"
                      disabled={form.formState.isSubmitting}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {form.formState.isSubmitting ? (
                          <LoaderCircle className="animate-spin" />
                        ) : (
                          "To the dashboard"
                        )}{" "}
                        <PartyPopper />
                      </span>
                    </ShinyButton>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
