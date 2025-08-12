import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <>
      <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="w-full p-4">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is PropertyPulse?</AccordionTrigger>
          <AccordionContent>
            PropertyPulse is a comprehensive CRM solution designed specifically
            for real estate professionals.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            How does PropertyPulse help my business?
          </AccordionTrigger>
          <AccordionContent>
            It helps you manage leads, automate tasks, and build stronger client
            relationships.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is there a free trial available?</AccordionTrigger>
          <AccordionContent>
            No, we currently do not offer a free trial, but you can explore our
            features through our demo.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default FAQ;
