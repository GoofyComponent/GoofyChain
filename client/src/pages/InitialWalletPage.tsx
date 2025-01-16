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
import { Input } from "@/components/ui/input";
import ShinyButton from "@/components/ui/shiny-button";
import { TextAnimate } from "@/components/ui/text-animate";
import TypingAnimation from "@/components/ui/typing-animation";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  walletId: z.string().min(2),
});

export const InitialWalletPage = () => {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletId: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    navigate({
      to: "/onboard/currency",
      state: {
        onboardings: {
          walletKey: values.walletId,
        },
      },
    });
  };

  return (
    <div className="flex min-h-[calc(90svh-4rem)] w-full items-center justify-center">
      <Helmet>
        <meta charSet="utf-8" />
        <title>GoofyChain - Onboarding - Wallet ID</title>
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
              <div className="w-1/2 bg-slate-50 rounded-xl h-2"></div>
              <div className="w-1/2 bg-slate-50 rounded-xl h-2 opacity-50"></div>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">
                <TypingAnimation>Let's get started !</TypingAnimation>
              </CardTitle>
              <CardDescription>
                <TextAnimate animation="blurInUp" by="character" delay={1000}>
                  To begin, please enter your wallet ID
                </TextAnimate>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-6">
                    <FormField
                      control={form.control}
                      name="walletId"
                      render={({ field }) => (
                        <FormItem className="grid gap-2">
                          <FormControl>
                            <Input {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <ShinyButton type="submit">
                      <span className="flex items-center justify-center gap-2">
                        Next step <ArrowRight />
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
