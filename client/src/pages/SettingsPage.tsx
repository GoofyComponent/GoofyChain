import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supportedCurrenciesEnum } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useAuth from "@/hooks/useAuth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const preferencesSchema = z.object({
  walletId: z.string().min(2),
  currency: z.enum(supportedCurrenciesEnum),
});

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    newPasswordConfirmation: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "Passwords do not match",
  });

const API_URL = import.meta.env.VITE_API_URL;

export const SettingsPage = () => {
  const { toast } = useToast();
  const { user, accessToken, update } = useAuth();

  const prefForm = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      walletId: user?.initialWalletId || "",
      currency: user?.preferedCurrency || "usd",
    },
  });
  const prefOnSubmit = async (values: z.infer<typeof preferencesSchema>) => {
    const updatePreferencesCall = await fetch(
      `${API_URL}/profile/data/preferences`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          walletId: values.walletId,
          preferedCurrency: values.currency,
        }),
      }
    );

    if (!updatePreferencesCall.ok) {
      console.error("Failed to update preferences");
      return;
    }

    await updatePreferencesCall.json();

    update({
      preferedCurrency: values.currency,
      initialWalletId: values.walletId,
    });

    toast({
      title: "Preferences Updated",
      description: "Your preferences have been updated",
    });

    return;
  };

  const passwordForm = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
  });
  const passwordOnSubmit = async (
    values: z.infer<typeof updatePasswordSchema>
  ) => {
    const updatePasswordCall = await fetch(`${API_URL}/profile/data/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        password: values.currentPassword,
        newPassword: values.newPassword,
      }),
    });

    if (!updatePasswordCall.ok) {
      console.error("Failed to update password");
      return;
    }

    await updatePasswordCall.json();

    toast({
      title: "Password Updated",
      description: "Your password has been updated",
    });

    return;
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="">
          <CardHeader>
            <CardTitle>Your preferences</CardTitle>
            <CardDescription>
              You can change your preferences here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...prefForm}>
              <form
                onSubmit={prefForm.handleSubmit(prefOnSubmit)}
                className="flex flex-col gap-4"
              >
                <FormField
                  control={prefForm.control}
                  name="walletId"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Wallet ID</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={prefForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormLabel>Prefered Currency</FormLabel>
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

                <Button type="submit">Save</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="">
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
            <CardDescription>
              You can change your password here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(passwordOnSubmit)}
                className="flex flex-col gap-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPasswordConfirmation"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Save</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
