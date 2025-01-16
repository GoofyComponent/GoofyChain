import { Button } from "@/components/ui/button";
import HyperText from "@/components/ui/hyper-text";
import Particles from "@/components/ui/particles";
import ReviewCarousel from "@/components/review-carousel";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import MorphingText from "@/components/ui/morphing-text";
import ShinyButton from "@/components/ui/shiny-button";
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
import { useNavigate } from "@tanstack/react-router";

export const Index = () => {
  const navigate = useNavigate();
  const texts = ["« Un seul mot »", "« Ethereum »"];
  return (
    <div className="overflow-hidden h-screen w-screen">
      <header className="fixed top-0 left-0 flex justify-between items-center bg-transparent text-white shadow-md w-screen h-12 px-3 pt-3 z-50">
        <div className="flex items-center space-x-4">
          <img src="/logo.png" className="h-10 select-none" />
        </div>
        <div className="ml-auto flex space-x-2">
          <Button
            className="p-2 rounded bg-transparent text-white border-none hover:bg-transparent hover:text-gray-300 select-none"
            onClick={() => navigate({ to: `/login` })}
          >
            Login
          </Button>
          <Button
            className="p-2 rounded bg-gray-900 text-white border-blue-900 hover:bg-gray-800 select-none"
            onClick={() => navigate({ to: `/register` })}
          >
            Sign up
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
          <ShinyButton
            className="p-3 font-bold text-white select-none"
            onClick={() => navigate({ to: `/register` })}
          >
            Get Started
          </ShinyButton>
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
