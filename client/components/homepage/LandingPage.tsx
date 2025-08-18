"use client";

import PricingCard from "./PricingCard";
import FAQ from "./FAQ";
import { subscriptionPlansList } from "@/constants/data";
import Header from "./header";
import CButton from "../global/CButton";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero */}
          <section className="mt-8 mb-16">
            <div className="rounded-xl overflow-hidden relative">
              <div>
                <div
                  className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-lg items-center justify-center p-4"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(/images/hero.png)",
                  }}
                >
                  <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                      Streamline Your Real Estate Business
                    </h1>
                    <h2 className="text-white text-lg font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                      The ultimate multi-tenant CRM for agencies, agents, and
                      property managers.
                    </h2>
                  </div>
                  <CButton btnHref="/auth/register" btnTxt="Get Started" />
                </div>
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section id="features" className="mb-16">
            <div className="flex flex-col gap-2 mb-8">
              <h1 className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                Key Features
              </h1>
              <p className="text-[#0d141c] text-base font-normal leading-normal max-w-[720px]">
                EstateElite offers a comprehensive suite of tools to help you
                stay organized and efficient.
              </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
              <div className="flex flex-col gap-3 pb-3">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                  style={{
                    backgroundImage: "url(/images/feature-1.png)",
                  }}
                ></div>
                <div>
                  <p className="text-[#0d141c] text-base font-medium leading-normal">
                    Lead Management
                  </p>
                  <p className="text-[#49739c] text-sm font-normal leading-normal">
                    Capture and nurture leads effectively with automated
                    follow-ups and personalized communication.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pb-3">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                  style={{
                    backgroundImage: "url(/images/feature-2.png)",
                  }}
                ></div>
                <div>
                  <p className="text-[#0d141c] text-base font-medium leading-normal">
                    Task Automation
                  </p>
                  <p className="text-[#49739c] text-sm font-normal leading-normal">
                    Automate repetitive tasks such as scheduling appointments
                    and sending reminders to save time and improve productivity.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pb-3">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                  style={{
                    backgroundImage: "url(/images/feature-3.png)",
                  }}
                ></div>
                <div>
                  <p className="text-[#0d141c] text-base font-medium leading-normal">
                    Client Relationship Management
                  </p>
                  <p className="text-[#49739c] text-sm font-normal leading-normal">
                    Build lasting relationships with clients through
                    personalized interactions and seamless communication.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-16">
            <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Testimonials
            </h2>
            <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&amp;::-webkit-scrollbar]:hidden">
              <div className="flex items-stretch p-4 gap-3">
                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
                    style={{
                      backgroundImage:
                        "url(https://lh3.googleusercontent.com/aida-public/AB6AXuCZCoJ9D-SnxNLX71OTRp0xjZwR9m9cfhjFHZLatdtcl3wAugM0M_Mxu9I94XDIV48o674TZ02vcalgpcUI_AzpcaH1NNjsx_TsRT_OPB7KDfXWrc-atrDf4KThQu3EkUBFDwFRxKRBMfGG6pvwUOhBtCP9MK_PU9L03pXE77zANPY1msbRnj3trSJVc_b5x_tN83jmAnpl-t24joDGY7BH62rkBS2A6FI2e7E2B0WR6DdZwiYYFvrCKe0N9H0n1xHLesV8HN5BRSnA)",
                    }}
                  ></div>
                  <div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal">
                      EstateElite has transformed the way I manage my business.
                      I can now handle more clients with less effort.
                    </p>
                    <p className="text-[#49739c] text-sm font-normal leading-normal">
                      Sophia Carter, Real Estate Agent
                    </p>
                  </div>
                </div>
                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
                    style={{
                      backgroundImage:
                        "url(https://lh3.googleusercontent.com/aida-public/AB6AXuD86YnEH2wYQwotfd96TglRACq1YaVzf7IYYEgPlQI1TjNCPbNG8bYL4Eto86IkQzHDCUR5YW1KCWzZRudeh0tqu3YTiF18CJ_KlHOVOHuk2mk5J0dq4Kdu-hs26eoyht-9LlJMXkfwZZiKVMOFCPBAKwUMiXDrmICzOUP7wNu3_5jTF122rxqJVt4O-PUlP01qeHML_vjUTpq8FocQnh1wLdJglpxA8MUodA_d6pcNhOz7gKyN-P9msErhAVfJ13RvOZ264qZMKlqf)",
                    }}
                  ></div>
                  <div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal">
                      The automation features have saved me countless hours,
                      allowing me to focus on closing deals.
                    </p>
                    <p className="text-[#49739c] text-sm font-normal leading-normal">
                      Ethan Bennett, Real Estate Broker
                    </p>
                  </div>
                </div>
                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
                    style={{
                      backgroundImage:
                        "url(https://lh3.googleusercontent.com/aida-public/AB6AXuD16mwTFALbmR4azrVxIpOEFxa1oGxdZKphwTJBHCLIvfE8O9MHeHMMMehXA07Rp6kINCPIpx2tsgpxadDQKKA2TFtOppcs3ZDTLE4qMcRCUOGJXPVU-2zsAkT5kXK6yMdxfxDtCYDh6EB2P-dv2wOP3O6zy2-enTuHsbYocPYiKewLftge2lwH3QGqmOhIuKrljE06ASaKe97fEY-zBtnyt9MeAaxh684oD2-xxF4WH3HxKXzRCDkNakMMWu2AlRzQVXmashbizMpY",
                    }}
                  ></div>
                  <div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal">
                      I love how easy it is to stay connected with my clients
                      and provide them with exceptional service.
                    </p>
                    <p className="text-[#49739c] text-sm font-normal leading-normal">
                      Olivia Hayes, Real Estate Agent
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Plans */}
          <section id="pricing" className="mb-16">
            <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Pricing Plans
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(228px,1fr))] gap-2.5 px-4 py-3 @3xl:grid-cols-4">
              {subscriptionPlansList.map((plan) => (
                <PricingCard key={plan.name} {...plan} />
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <FAQ />
          </section>

          {/* Contact */}
          <section id="contact" className="mb-16">
            <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Contact Us
            </h2>
            <div className="flex flex-col gap-4 md:flex-row md:gap-8 px-4">
              <form action="" className="max-w-[480px] flex-1">
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">
                      Name
                    </p>
                    <input
                      placeholder="Your Name"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal"
                      value=""
                      type="text"
                      onChange={() => {}}
                    />
                  </label>
                </div>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">
                      Email
                    </p>
                    <input
                      placeholder="Your Email"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal"
                      value=""
                      type="email"
                      onChange={() => {}}
                    />
                  </label>
                </div>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">
                      Message
                    </p>
                    <textarea
                      placeholder="Your Message"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] min-h-36 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal"
                    ></textarea>
                  </label>
                </div>
                <div className="flex px-4 py-3 justify-start">
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#3d99f5] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Send Message</span>
                  </button>
                </div>
              </form>
              <div>
                <div className="text-[#0d141c] text-base font-normal leading-normal px-4 bg-pink-300 flex-1/2">
                  <div className="max-w-[480px]"></div>
                </div>
              </div>
            </div>
            <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Contact Information
            </h3>
            <p className="text-[#0d141c] text-base font-normal leading-normal pb-3 pt-1 px-4">
              Email: support@estateelite.com
            </p>
            <p className="text-[#0d141c] text-base font-normal leading-normal pb-3 pt-1 px-4">
              Phone: (555) 123-4567
            </p>
            <p className="text-[#0d141c] text-base font-normal leading-normal pb-3 pt-1 px-4">
              Address: 123 Main Street, Anytown, USA
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex justify-center">
        <div className="flex max-w-[960px] flex-1 flex-col">
          <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
            <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
              <a
                className="text-[#49739c] text-base font-normal leading-normal min-w-40"
                href="#"
              >
                Home
              </a>
              <a
                className="text-[#49739c] text-base font-normal leading-normal min-w-40"
                href="#"
              >
                Features
              </a>
              <a
                className="text-[#49739c] text-base font-normal leading-normal min-w-40"
                href="#"
              >
                Pricing
              </a>
              <a
                className="text-[#49739c] text-base font-normal leading-normal min-w-40"
                href="#"
              >
                Contact
              </a>
              <a
                className="text-[#49739c] text-base font-normal leading-normal min-w-40"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="text-[#49739c] text-base font-normal leading-normal min-w-40"
                href="#"
              >
                Terms of Service
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#">
                <div
                  className="text-[#49739c]"
                  data-icon="TwitterLogo"
                  data-size="24px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24px"
                    height="24px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"></path>
                  </svg>
                </div>
              </a>
              <a href="#">
                <div
                  className="text-[#49739c]"
                  data-icon="FacebookLogo"
                  data-size="24px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24px"
                    height="24px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z"></path>
                  </svg>
                </div>
              </a>
              <a href="#">
                <div
                  className="text-[#49739c]"
                  data-icon="InstagramLogo"
                  data-size="24px"
                  data-weight="regular"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24px"
                    height="24px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path>
                  </svg>
                </div>
              </a>
            </div>
            <p className="text-[#49739c] text-base font-normal leading-normal">
              © 2024 PropertyPulse. All rights reserved.
            </p>
          </footer>
        </div>
      </footer>
    </div>
  );
}
