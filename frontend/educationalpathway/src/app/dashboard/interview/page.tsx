"use client";

import { useCallback, useState } from "react";
import { VisaPrepHub } from "@/features/interview/components/VisaPrepHub";
import { ActiveCallInterface } from "@/features/interview/components/ActiveCallInterface";
import { PostInterviewAnalytics } from "@/features/interview/components/PostInterviewAnalytics";
import { finalizeVisaInterview, initiateVisaCall } from "@/features/interview/api/visa-api";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/api";

type Step = "hub" | "calling" | "results";

type CallEndEvent = {
  interviewId: string;
  reason: "completed" | "connect_error" | "runtime_error" | "user_interrupted" | "time_limit";
  callStarted: boolean;
};

export default function InterviewPage() {
  const [step, setStep] = useState<Step>("hub");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [vapiStartPayload, setVapiStartPayload] = useState<Record<string, any> | string | null>(null);
  const [interviewId, setInterviewId] = useState<string>("");

  const handleStartInterview = async (country: string) => {
    const loadingToast = toast.loading("Preparing your embassy connection...");
    try {
      setSelectedCountry(country);
      
      const res = await initiateVisaCall({ country } as any);
      const data = res?.status === "success" ? res.data : res;

      // Backend can return a web-call token/url, inline assistant config, or assistant id.
      const resolvedStartPayload =
        data?.webCallToken ??
        data?.webCallUrl ??
        data?.assistantConfig ??
        data?.assistant ??
        data?.assistantId;

      if (!resolvedStartPayload || !data?.interviewId) {
        throw new Error("Interview session payload is incomplete. Please try again.");
      }

      setVapiStartPayload(resolvedStartPayload);
      setInterviewId(data.interviewId);
      
      setStep("calling");
    } catch (err) {
      const reason = getErrorMessage(err, "Embassy systems are busy. Try again shortly.");
      toast.error(reason);
      console.error("Initiate call failed", err);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleCallEnd = useCallback((event: CallEndEvent) => {
    if (event.callStarted) {
      finalizeVisaInterview(event.interviewId).catch((err) => {
        console.error("Finalize interview failed", err);
      });
      if (event.reason === "user_interrupted") {
        toast("Interview ended by user.");
      }
      if (event.reason === "time_limit") {
        toast("Interview reached the 5-minute limit.");
      }
      setStep("results");
      return;
    }

    if (event.reason === "user_interrupted") {
      toast("Interview was canceled.");
      setStep("hub");
      return;
    }

    if (event.reason === "connect_error") {
      toast.error("Interview connection failed before session start. Please try again.");
    } else {
      toast.error("Interview ended unexpectedly before it started.");
    }
    setStep("hub");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {step === "hub" && (
        <VisaPrepHub onStartInterview={handleStartInterview} />
      )}
      
      {step === "calling" && (
        <ActiveCallInterface 
          country={selectedCountry}
          assistantConfig={vapiStartPayload ?? {}}
          interviewId={interviewId}
          onCallEnd={handleCallEnd}
        />
      )}

      {step === "results" && (
        <PostInterviewAnalytics 
          interviewId={interviewId}
          onRestart={() => setStep("hub")}
        />
      )}
    </div>
  );
}
