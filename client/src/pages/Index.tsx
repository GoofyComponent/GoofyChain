import { Button } from "@/components/ui/button";
import HyperText from "@/components/ui/hyper-text";
import Particles from "@/components/ui/particles";
import ReviewCarousel from "@/components/review-carousel";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import MorphingText from "@/components/ui/morphing-text";
import ShinyButton from "@/components/ui/shiny-button";
import { Helmet } from "react-helmet";
import {
  DollarSign,
  Euro,
  IndianRupee,
  JapaneseYen,
  PhilippinePeso,
  PoundSterling,
  RussianRuble,
  SwissFranc,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import logo from "@/assets/img/logo.png";

export const Index = () => {
  const texts = ["« Un seul mot »", "« Ethereum »"];
  return (
    <div className="overflow-hidden h-screen w-screen">
      <Helmet>
        <meta charSet="utf-8" />
        <title>GoofyChain - The best place to follow your wallet</title>
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
      <header className="fixed top-0 left-0 flex justify-between items-center bg-transparent text-white shadow-md w-screen h-12 px-3 pt-3 z-50">
        <div className="flex items-center space-x-4">
          <img src={logo} className="h-10 select-none" />
        </div>
        <div className="ml-auto flex space-x-2">
          <Button
            className="p-2 rounded bg-transparent text-white border-none hover:bg-transparent hover:text-gray-300 select-none"
            asChild
          >
            <Link to="/login">Login</Link>
          </Button>
          <Button
            className="p-2 rounded bg-gray-900 text-white border-blue-900 hover:bg-gray-800 select-none"
            asChild
          >
            <Link to="/register">Sign up</Link>
          </Button>
        </div>
      </header>
      <div className="relative flex h-[calc(100vh-48px)] flex-col items-center justify-center gap-6 bg-background md:p-10">
        <Particles
          className="absolute inset-0 z-0"
          quantity={300}
          ease={10}
          color={"#FFFFFF"}
          refresh
        />
        <HyperText
          className="text-5xl font-bold select-none"
          animateOnHover={false}
        >
          GoofyChain
        </HyperText>
        <MorphingText className="text-3xl" texts={texts} />
        <p className="text-lg text-center max-w-2xl select-none">
          Welcome to GoofyChain, and join the best platform to view transactions
          and Ethereum prices.
        </p>
        <div className="flex space-x-4">
          <Link to="/register">
            <ShinyButton className="p-3 font-bold text-white select-none">
              Get Started
            </ShinyButton>
          </Link>
        </div>
        <ReviewCarousel className="mt-8" />
        <div className="absolute right-[-275px] top-1/2 transform translate-x-1/2 -translate-y-1/2 hidden xl:block">
          <OrbitingCircles
            iconSize={50}
            radius={500}
            speed={1}
            path={false}
            reverse={true}
          >
            <Euro className="h-[50px] w-[50px] select-none" />
            <JapaneseYen className="h-[50px] w-[50px] select-none" />
            <DollarSign className="h-[50px] w-[50px] select-none" />
            <PoundSterling className="h-[50px] w-[50px] select-none" />
            <IndianRupee className="h-[50px] w-[50px] select-none" />
            <PhilippinePeso className="h-[50px] w-[50px] select-none" />
            <RussianRuble className="h-[50px] w-[50px] select-none" />
            <SwissFranc className="h-[50px] w-[50px] select-none" />
          </OrbitingCircles>
        </div>
      </div>
    </div>
  );
};
