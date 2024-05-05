'use client'
import React, { useState } from "react";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
    //should have a link to delecting an account? also should this be rate limited e.g. must wait 48hrs after last activity (change of checkboxes)
  const questions = [
    { question: "Why can't I click the checkbox?", answer: "You can only" },
    { question: "Question 2", answer: "Answer 2" },
    // Add more questions as needed
  ];

  return (
    <div className="flex items-center justify-center bg-white py-5">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-center text-pink-700">Frequently Asked Questions</h1>
        {questions.map((item, index) => (
          <div key={index} className="text-left w-full mt-4">
            <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="font-bold">
              {item.question}
            </button>
            {openIndex === index && <p className="mt-2">{item.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}