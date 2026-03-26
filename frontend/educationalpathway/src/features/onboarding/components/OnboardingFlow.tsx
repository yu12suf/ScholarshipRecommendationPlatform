"use client";

import {
  FileText,
  Scan,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import { StudentProfileForm } from "@/features/student/components/profile-form/StudentProfileForm";

export function OnboardingFlow() {
  const {
    step,
    loading,
    files,
    handleFileChange,
    handleStage1,
    handleStage2,
    handleStage3,
  } = useOnboarding();

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image 
            src="/admas.png" 
            alt="Logo" 
            width={40} 
            height={40} 
            className="h-10 w-10 object-contain"
          />
          <h1 className="text-2xl font-bold text-primary">
            Setting Up Your Account
          </h1>
        </div>

        {/* Multi-step indicator */}
        <div className="flex justify-between mb-12 relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
          <div
            className={`absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500 w-[${
              ((step - 1) / 2) * 100
            }%]`}
          ></div>

          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-lg ${
                  step >= s
                    ? "bg-primary text-white scale-110 shadow-primary/20"
                    : "bg-white text-gray-400 border border-gray-200"
                }`}
              >
                {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
              </div>
              <span
                className={`text-xs font-bold ${step >= s ? "text-primary" : "text-gray-400"}`}
              >
                {s === 1
                  ? "Scan Papers"
                  : s === 2
                    ? "Verify Who You Are"
                    : "Complete Profile"}
              </span>
            </div>
          ))}
        </div>

        <Card className="shadow-2xl border border-gray-100 min-h-125 flex flex-col">
          <CardBody className="p-8 md:p-12 flex-1 flex flex-col">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Scan className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Scan Documents</h2>
                  <p className="text-muted-foreground mt-2">
                    Upload your CV or school records. Our AI will read the info
                    for you.
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-primary/50 transition-colors group relative cursor-pointer">
                  <input
                    type="file"
                    id="document-upload"
                    aria-label="Upload CV or Transcript"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(e, "document")}
                    accept="image/*,application/pdf"
                  />
                  <Upload className="h-10 w-10 text-gray-300 group-hover:text-primary transition-colors mx-auto mb-4" />
                  <p className="font-bold text-gray-600">
                    {files.document
                      ? files.document.name
                      : "Click to upload CV or records"}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    PDF, JPG, or PNG (MAX. 5MB)
                  </p>
                </div>

                <Button
                  onClick={handleStage1}
                  disabled={loading || !files.document}
                  isLoading={loading}
                  size="xl"
                  variant="scholarship"
                  className="w-full font-bold shadow-lg shadow-primary/20"
                >
                  Next <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                  <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold">Verify Identity</h2>
                  <p className="text-muted-foreground mt-2">
                    Please upload your ID card and a selfie.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-accent/50 transition-colors relative cursor-pointer bg-gray-50/50">
                    <input
                      type="file"
                      id="id-card-upload"
                      aria-label="Upload ID Card"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleFileChange(e, "idCard")}
                      accept="image/*"
                    />
                    <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-bold truncate">
                      {files.idCard ? files.idCard.name : "Upload ID Card"}
                    </p>
                  </div>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-accent/50 transition-colors relative cursor-pointer bg-gray-50/50">
                    <input
                      type="file"
                      id="selfie-upload"
                      aria-label="Upload Selfie"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleFileChange(e, "selfie")}
                      accept="image/*"
                    />
                    <UserCheck className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-bold truncate">
                      {files.selfie ? files.selfie.name : "Upload Selfie"}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-sm flex gap-3 text-sm text-yellow-800">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>Ensure your face is clear and matches your ID.</p>
                </div>

                <Button
                  onClick={handleStage2}
                  disabled={loading || !files.idCard || !files.selfie}
                  isLoading={loading}
                  variant="scholarship"
                  size="xl"
                  className="w-full font-bold shadow-lg shadow-secondary/20"
                >
                  Verify <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-center">
                  Complete Your Profile
                </h2>
                <p className="text-muted-foreground text-center">
                  Fill in the information below so we can match you with the
                  right scholarships.
                </p>

                <StudentProfileForm onSubmit={handleStage3} />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
