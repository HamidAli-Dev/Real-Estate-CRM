import { subscriptionPlansList } from "@/constants/data";

const PricingCard = ({
  name,
  price,
  duration,
  features,
  stripePriceId,
}: (typeof subscriptionPlansList)[number]) => {
  const isMostPopular = name === "Standard";
  return (
    <div className="flex flex-1 flex-col gap-4 rounded-lg border border-solid border-[#cedbe8] bg-slate-50 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[#0d141c] text-base font-bold leading-tight">
          {name}
        </h1>
        <p className="flex items-baseline gap-1 text-[#0d141c]">
          <span className="text-[#0d141c] text-4xl font-black leading-tight tracking-[-0.033em]">
            ${price}
          </span>
          <span className="text-[#0d141c] text-base font-bold leading-tight">
            /{duration}
          </span>
        </p>
      </div>

      <button
        className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]`}
        onClick={() => {
          // Later: trigger checkout using stripePriceId
          console.log(`Selected plan: ${name} (${stripePriceId})`);
        }}
      >
        <span className="truncate">Choose {name}</span>
      </button>

      <div className="flex flex-col gap-2">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]"
          >
            <div
              className="text-[#0d141c]"
              data-icon="Check"
              data-size="20px"
              data-weight="regular"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20px"
                height="20px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
            </div>
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingCard;
