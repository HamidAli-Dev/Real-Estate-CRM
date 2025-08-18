import React from "react";
import { CardDescription, CardTitle } from "../ui/card";

interface FormHeadingProps {
  title: string;
  description: string;
}

const FormHeading = ({ title, description }: FormHeadingProps) => {
  return (
    <>
      <CardTitle className="text-lg text-center">{title}</CardTitle>
      <CardDescription className="text-center mb-3">
        {description}
      </CardDescription>
    </>
  );
};

export default FormHeading;
