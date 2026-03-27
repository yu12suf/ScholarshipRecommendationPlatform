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
                className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step >= s
                    ? "bg-primary text-white scale-110"
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

        <Card className="border border-border min-h-125 flex flex-col">
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

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-primary/50 transition-colors group relative cursor-pointer min-h-60 flex flex-col items-center justify-center bg-gray-50/10">
                  <input
                    type="file"
                    id="document-upload"
                    aria-label="Upload CV or Transcript"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => handleFileChange(e, "document")}
                    accept="image/*,application/pdf"
                  />
                  
                  {files.document ? (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                      <div className="w-20 h-20 rounded-full border-4 border-success/20 bg-success/5 flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-inner">
                        {files.document.type.startsWith("image/") ? (
                          <img 
                            src={URL.createObjectURL(files.document)} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <FileText className="h-10 w-10 text-success" />
                        )}
                      </div>
                      <p className="font-bold text-foreground truncate max-w-[250px] mx-auto">
                        {files.document.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click to replace file
                      </p>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-300">
                      <Upload className="h-12 w-12 text-gray-300 group-hover:text-primary transition-colors mx-auto mb-4" />
                      <p className="font-bold text-gray-600">
                        Click to upload CV or records
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        PDF, JPG, or PNG (MAX. 5MB)
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleStage1}
                  disabled={loading || !files.document}
                  isLoading={loading}
                  size="xl"
                  variant="scholarship"
                  className="w-full font-bold"
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
                  {/* ID Card Upload */}
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-accent/50 transition-colors relative cursor-pointer bg-gray-50/20 min-h-48 flex flex-col items-center justify-center">
                    <input
                      type="file"
                      id="id-card-upload"
                      aria-label="Upload ID Card"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleFileChange(e, "idCard")}
                      accept="image/*"
                    />

                    {files.idCard ? (
                      <div className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full border-4 border-accent/20 bg-accent/5 flex items-center justify-center mx-auto mb-3 overflow-hidden shadow-inner">
                          <img 
                            src={URL.createObjectURL(files.idCard)} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <p className="text-sm font-bold text-foreground truncate max-w-[150px] mx-auto">
                          {files.idCard.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">Click to replace</p>
                      </div>
                    ) : (
                      <div className="animate-in fade-in duration-300">
                        <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-600">Upload ID Card</p>
                      </div>
                    )}
                  </div>

                  {/* Selfie Upload */}
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-accent/50 transition-colors relative cursor-pointer bg-gray-50/20 min-h-48 flex flex-col items-center justify-center">
                    <input
                      type="file"
                      id="selfie-upload"
                      aria-label="Upload Selfie"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleFileChange(e, "selfie")}
                      accept="image/*"
                    />

                    {files.selfie ? (
                      <div className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full border-4 border-accent/20 bg-accent/5 flex items-center justify-center mx-auto mb-3 overflow-hidden shadow-inner">
                          <img 
                            src={URL.createObjectURL(files.selfie)} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <p className="text-sm font-bold text-foreground truncate max-w-[150px] mx-auto">
                          {files.selfie.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">Click to replace</p>
                      </div>
                    ) : (
                      <div className="animate-in fade-in duration-300">
                        <UserCheck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-600">Upload Selfie</p>
                      </div>
                    )}
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
                  className="w-full font-bold"
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
