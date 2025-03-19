import React from "react";
import { Check } from "lucide-react";

const ACard = ({ heading, para }) => {
  return (
    <div
      className="
        flex flex-col
        text-left
        gap-4
        p-6
        m-3
        rounded-lg
        shadow-lg
        border-2
        border-transparent
        bg-gradient-to-r from-[#ff7637] to-[#fe7641]
        text-white
        transition-all
        duration-200
        hover:shadow-xl
        hover:scale-[1.05]
      "
    >
      <h2 className="font-bold text-2xl">{heading}</h2>
      <p className="text-lg text-gray-200">{para}</p>
    </div>
  );
};

function Card({ name, tagline }) {
  let featureList = [];
  const planName = name.toLowerCase();
  let cc = "";

  if (planName === "basic") {
    featureList = ["Limited Skips", "Standard Audio", "Ads Supported"];
    cc = "200";
  } else if (planName === "premium") {
    featureList = ["Unlimited Skips", "High-Quality Audio", "Ad-Free Experience"];
    cc = "500";
  } else {
    featureList = ["Family Sharing", "Ultra HD Audio", "6 User Accounts"];
    cc = "1000";
  }

  const isPopular = planName === "premium";

  return (
    <div
      className={`flex flex-col rounded-lg p-6 items-center
        text-white shadow-xl transition-all 
       cursor-pointer hover:shadow-2xl hover:scale-[1.05] 
        ${isPopular ? "border-4 border-[#fe7641]" : "border border-gray-300"}
      `}
    >
      {isPopular && (
        <span className="bg-[#fe7641] text-white text-sm px-3 py-1 text-center rounded-full self-start mb-2">
          Most Popular
        </span>
      )}
      <h2 className="text-2xl font-bold mb-1">{name}</h2>
      <p className="text-gray-100 mb-4">{tagline}</p>
      <p className="text-4xl font-extrabold mb-4">₹{cc}<span className="text-base font-medium">/month</span></p>

      <ul className="space-y-2 mb-6">
        {featureList.map((elm, ind) => (
          <li key={ind} className="flex items-center">
            <Check className="text-[#fe7641] mr-2" size={24} />
            <span>{elm}</span>
          </li>
        ))}
      </ul>

      <button
        className="w-full bg-[#fe7641] text-white font-bold py-2 rounded-md transition-all hover:text-[#ffffff]"
      >
        Select {name}
      </button>
    </div>
  );
}

function PremiumPage() {
  return (
    <div className="text-white font-mono overflow-y-scroll w-full h-full p-6 ">
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold">
          Unlock unlimited access to millions of songs, ad-free listening, and exclusive features.
        </h2>
        <div className="mt-10 flex justify-center gap-6">
          <button className="border-2 border-[#fe7641] text-white px-6 py-3 rounded-full font-bold hover:bg-[#fe7641]">
            Try Free For 30 Days
          </button>
          <button className="border-2 border-[#fe7641] text-[#fe7641] px-6 py-3 rounded-full font-bold hover:bg-[#fe7641] hover:text-white">
            View Plans
          </button>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-4xl font-extrabold">Choose Your Premium Plan</h2>
        <div className="flex flex-wrap justify-center gap-10 mt-8">
          <Card name="Basic" tagline="For casual listeners" />
          <Card name="Premium" tagline="For music enthusiasts" />
          <Card name="Family" tagline="For multiple users" />
        </div>
      </div>
      
      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold">Ready to Upgrade Your Music Experience?</h2>
        <h2 className="text-xl font-semibold mt-2">
          Choose your plan and start enjoying premium music features today!
        </h2>
        <div className="mt-6">
          <button className="bg-[#fe7641] hover:bg-[#fe7641] text-white font-bold py-3 px-6 rounded-lg text-lg">
            Upgrade Now
          </button>
          <p className="mt-2 text-gray-100">No credit card required for trial. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PremiumPage);