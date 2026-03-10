"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  GraduationCap,
  FileText,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Flag,
  Award,
  School,
  Upload,
} from "lucide-react";
import Select, { MultiValue, SingleValue } from "react-select";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { profileSchema, ProfileFormValues } from "../../lib/profile-schema";
import { ALL_COUNTRIES } from "../../constants/countries";

interface MultiStepFormProps {
  initialData?: Partial<ProfileFormValues>;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
}

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
  description: string;
  fields: string[];
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "Personal Details",
    icon: User,
    description: "Basic information about you",
    fields: [
      "fullName",
      "email",
      "phoneNumber",
      "dateOfBirth",
      "gender",
      "nationality",
      "countryOfResidence",
      "city",
    ],
  },
  {
    id: 2,
    title: "Academic Background",
    icon: GraduationCap,
    description: "Your educational qualifications",
    fields: [
      "currentEducationLevel",
      "degreeSeeking",
      "fieldOfStudyInput",
      "previousUniversity",
      "graduationYear",
      "gpa",
      "languageTestType",
      "testScore",
      "researchArea",
    ],
  },
  {
    id: 3,
    title: "Preferences & Documents",
    icon: FileText,
    description: "Your preferences and supporting documents",
    fields: [
      "preferredDegreeLevel",
      "preferredFundingType",
      "studyMode",
      "preferredCountries",
      "preferredUniversities",
      "workExperience",
      "familyIncomeRange",
      "needsFinancialSupport",
      "documents",
      "notifications",
    ],
  },
];

export const StudentProfileForm: React.FC<MultiStepFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universities, setUniversities] = useState<{ name: string }[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const methods = useForm<ProfileFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema) as any,
    mode: "onChange",
    defaultValues: {
      preferredDegreeLevel: [],
      preferredCountries: [],
      preferredUniversities: [],
      fieldOfStudyInput: [],
      workExperience: [],
      needsFinancialSupport: false,
      notifications: { email: true, sms: false, inSystem: true },
      documents: {},
      ...initialData,
    },
  });

  const {
    watch,
    setValue,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isDirty, isValid },
  } = methods;
  const watchedCountries = watch("preferredCountries");
  const countryOfResidence = watch("countryOfResidence");

  const {
    fields: uniFields,
    append: appendUni,
    remove: removeUni,
  } = useFieldArray({
    control,
    name: "preferredUniversities",
  });

  const {
    fields: workFields,
    append: appendWork,
    remove: removeWork,
  } = useFieldArray({
    control,
    name: "workExperience",
  });

  const fetchCities = useCallback(
    async (country: string, signal?: AbortSignal) => {
      if (!country) return;
      setLoadingCities(true);
      try {
        const response = await fetch("/api/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country }),
          signal,
        });
        if (!response.ok) throw new Error("Failed to fetch cities");
        const data = await response.json();
        setCities(data.cities || []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching cities:", error);
        toast.error("Unable to load cities. Please try again.");
      } finally {
        setLoadingCities(false);
      }
    },
    [],
  );

  const fetchUniversities = useCallback(
    async (country: string, signal?: AbortSignal) => {
      if (!country) return;
      setLoadingUniversities(true);
      try {
        const response = await fetch(
          `https://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`,
          { signal },
        );
        if (!response.ok) throw new Error("Failed to fetch universities");
        const data = await response.json();
        setUniversities(data.slice(0, 50).map((u: { name: string }) => ({ name: u.name })));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching universities:", error);
        toast.error("Unable to load universities. Please try again.");
      } finally {
        setLoadingUniversities(false);
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    if (countryOfResidence) {
      fetchCities(countryOfResidence, controller.signal);
    }
    return () => controller.abort();
  }, [countryOfResidence, fetchCities]);

  useEffect(() => {
    const controller = new AbortController();
    if (watchedCountries?.length > 0 && currentStep === 3) {
      fetchUniversities(watchedCountries[0], controller.signal);
    }
    return () => controller.abort();
  }, [watchedCountries, currentStep, fetchUniversities]);

  const validateStep = async (step: number): Promise<boolean> => {
    const stepFields = STEPS[step - 1].fields as (keyof ProfileFormValues)[];
    const result = await trigger(stepFields);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success("Profile submitted successfully!", {
        icon: "🎉",
        duration: 5000,
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Complete Your Profile
            </h1>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() =>
                      step.id <= currentStep && setCurrentStep(step.id)
                    }
                    className="focus:outline-none"
                    disabled={step.id > currentStep}
                    aria-label={`Go to step ${step.id}: ${step.title}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : isCompleted
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                  </button>
                  <span className="text-xs mt-2 text-gray-600">
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > index + 1 ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <User size={20} className="text-blue-600" />
                      Personal Details
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {STEPS[0].description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input
                          {...methods.register("fullName")}
                          placeholder="John Doe"
                          className="pl-10"
                          error={errors.fullName?.message}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input
                          {...methods.register("email")}
                          type="email"
                          placeholder="john@example.com"
                          className="pl-10"
                          error={errors.email?.message}
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input
                          {...methods.register("phoneNumber")}
                          placeholder="+1 (555) 000-0000"
                          className="pl-10"
                          error={errors.phoneNumber?.message}
                        />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input
                          {...methods.register("dateOfBirth")}
                          type="date"
                          className="pl-10"
                          error={errors.dateOfBirth?.message}
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      <select
                        {...methods.register("gender")}
                        className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">
                          Prefer not to say
                        </option>
                      </select>
                    </div>

                    {/* Nationality */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Nationality <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Flag
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                          size={18}
                        />
                        <Select
                          options={ALL_COUNTRIES.map((c) => ({
                            value: c,
                            label: c,
                          }))}
                          onChange={(
                            val: SingleValue<{ value: string; label: string }>,
                          ) => setValue("nationality", val?.value || "")}
                          className="react-select-container pl-7"
                          classNamePrefix="react-select"
                          placeholder="Select nationality"
                          isClearable
                        />
                      </div>
                    </div>

                    {/* Country of Residence */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Country of Residence{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                          size={18}
                        />
                        <Select
                          options={ALL_COUNTRIES.map((c) => ({
                            value: c,
                            label: c,
                          }))}
                          onChange={(
                            val: SingleValue<{ value: string; label: string }>,
                          ) => setValue("countryOfResidence", val?.value || "")}
                          className="react-select-container pl-7"
                          classNamePrefix="react-select"
                          placeholder="Select country"
                          isClearable
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <Select
                        options={cities.map((city) => ({
                          value: city,
                          label: city,
                        }))}
                        isLoading={loadingCities}
                        isDisabled={!countryOfResidence}
                        onChange={(
                          val: SingleValue<{ value: string; label: string }>,
                        ) => setValue("city", val?.value || "")}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder={
                          !countryOfResidence
                            ? "Select country first"
                            : "Select city"
                        }
                        isClearable
                      />
                      {errors.city && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Background */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <GraduationCap size={20} className="text-blue-600" />
                      Academic Background
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {STEPS[1].description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Education Level */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Current Education Level{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...methods.register("currentEducationLevel")}
                        className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select level</option>
                        <option value="High School">High School</option>
                        <option value="Bachelor's">Bachelor&apos;s Degree</option>
                        <option value="Master's">Master&apos;s Degree</option>
                        <option value="PhD">PhD</option>
                      </select>
                    </div>

                    {/* Degree Seeking */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Degree Seeking <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...methods.register("degreeSeeking")}
                        className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select degree</option>
                        <option value="Bachelor's">Bachelor&apos;s</option>
                        <option value="Master's">Master&apos;s</option>
                        <option value="PhD">PhD</option>
                      </select>
                    </div>

                    {/* Field of Study */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Field of Study <span className="text-red-500">*</span>
                      </label>
                      <Select
                        isMulti
                        options={[
                          {
                            value: "Computer Science",
                            label: "Computer Science",
                          },
                          { value: "Engineering", label: "Engineering" },
                          {
                            value: "Business",
                            label: "Business Administration",
                          },
                          { value: "Medicine", label: "Medicine" },
                          { value: "Law", label: "Law" },
                          { value: "Arts", label: "Arts & Humanities" },
                          { value: "Sciences", label: "Natural Sciences" },
                          {
                            value: "Social Sciences",
                            label: "Social Sciences",
                          },
                        ]}
                        onChange={(
                          val: MultiValue<{ value: string; label: string }>,
                        ) =>
                          setValue(
                            "fieldOfStudyInput",
                            val.map((v) => v.value),
                          )
                        }
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select your fields of study"
                      />
                    </div>

                    {/* Previous University */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Previous University
                      </label>
                      <div className="relative">
                        <School
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input
                          {...methods.register("previousUniversity")}
                          placeholder="University name"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Graduation Year */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Graduation Year
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input
                          {...methods.register("graduationYear", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          placeholder="2024"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* GPA */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        GPA
                      </label>
                      <div className="relative">
                        <Award
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input
                          {...methods.register("gpa", { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          placeholder="3.8"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Language Test Type */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Language Test
                      </label>
                      <select
                        {...methods.register("languageTestType")}
                        className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="None">None</option>
                        <option value="IELTS">IELTS</option>
                        <option value="TOEFL">TOEFL</option>
                        <option value="Duolingo">Duolingo</option>
                      </select>
                    </div>

                    {/* Test Score */}
                    {watch("languageTestType") !== "None" && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Test Score
                        </label>
                        <Input
                          {...methods.register("testScore")}
                          placeholder="e.g., 7.5"
                        />
                      </div>
                    )}

                    {/* Research Area */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Research Area (Optional)
                      </label>
                      <Input
                        {...methods.register("researchArea")}
                        placeholder="e.g., Artificial Intelligence, Climate Change"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Preferences & Documents */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <FileText size={20} className="text-blue-600" />
                      Preferences & Documents
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {STEPS[2].description}
                    </p>
                  </div>

                  {/* Study Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-800">
                      Study Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Preferred Degree Levels */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Preferred Degree Levels
                        </label>
                        <Select
                          isMulti
                          options={[
                            { value: "Bachelor's", label: "Bachelor's" },
                            { value: "Master's", label: "Master's" },
                            { value: "PhD", label: "PhD" },
                          ]}
                          onChange={(
                            val: MultiValue<{ value: string; label: string }>,
                          ) =>
                            setValue(
                              "preferredDegreeLevel",
                              val.map((v) => v.value),
                            )
                          }
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Select degree levels"
                        />
                      </div>

                      {/* Funding Type */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Funding Type
                        </label>
                        <select
                          {...methods.register("preferredFundingType")}
                          className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="Fully Funded">Fully Funded</option>
                          <option value="Partially Funded">
                            Partially Funded
                          </option>
                          <option value="Tuition Only">Tuition Only</option>
                        </select>
                      </div>

                      {/* Study Mode */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Study Mode
                        </label>
                        <select
                          {...methods.register("studyMode")}
                          className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="On-Campus">On-Campus</option>
                          <option value="Online">Online</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Preferred Countries */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-800">
                      Preferred Destinations
                    </h3>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Preferred Countries
                      </label>
                      <Select
                        isMulti
                        options={ALL_COUNTRIES.map((c) => ({
                          value: c,
                          label: c,
                        }))}
                        onChange={(
                          val: MultiValue<{ value: string; label: string }>,
                        ) =>
                          setValue(
                            "preferredCountries",
                            val.map((v) => v.value),
                          )
                        }
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select countries"
                      />
                    </div>

                    {/* Preferred Universities */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Preferred Universities
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            appendUni({
                              name: "",
                              country: watchedCountries?.[0] || "",
                              preferenceLevel: "Medium",
                            })
                          }
                          className="text-xs"
                        >
                          <Plus size={14} className="mr-1" /> Add University
                        </Button>
                      </div>

                      {uniFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="col-span-2">
                              <Select
                                options={universities.map((u) => ({
                                  value: u.name,
                                  label: u.name,
                                }))}
                                isLoading={loadingUniversities}
                                onChange={(
                                  val: SingleValue<{
                                    value: string;
                                    label: string;
                                  }>,
                                ) =>
                                  setValue(
                                    `preferredUniversities.${index}.name`,
                                    val?.value || "",
                                  )
                                }
                                aria-label="Search university"
                                className="react-select-container text-sm"
                                classNamePrefix="react-select"
                                placeholder="Search university"
                                isClearable
                              />
                            </div>
                            <div>
                              <select
                                {...methods.register(
                                  `preferredUniversities.${index}.preferenceLevel`,
                                )}
                                aria-label="Preference level"
                                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                              >
                                <option value="High">High Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="Low">Low Priority</option>
                              </select>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeUni(index)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove university"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Work Experience */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md font-medium text-gray-800">
                        Work Experience
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendWork({
                            organizationName: "",
                            jobTitle: "",
                            yearsOfExperience: 0,
                          })
                        }
                        className="text-xs"
                      >
                        <Plus size={14} className="mr-1" /> Add Experience
                      </Button>
                    </div>

                    {workFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            {...methods.register(
                              `workExperience.${index}.organizationName`,
                            )}
                            aria-label="Organization name"
                            placeholder="Organization"
                            className="text-sm"
                          />
                          <Input
                            {...methods.register(
                              `workExperience.${index}.jobTitle`,
                            )}
                            aria-label="Job title"
                            placeholder="Job Title"
                            className="text-sm"
                          />
                          <Input
                            {...methods.register(
                              `workExperience.${index}.yearsOfExperience`,
                              { valueAsNumber: true },
                            )}
                            aria-label="Years of experience"
                            type="number"
                            placeholder="Years"
                            className="text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWork(index)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove work experience"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Financial Information */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-800">
                      Financial Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Family Income Range
                        </label>
                        <select
                          {...methods.register("familyIncomeRange")}
                          className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select range</option>
                          <option value="< $10,000">Below $10,000</option>
                          <option value="$10,000 - $30,000">
                            $10,000 - $30,000
                          </option>
                          <option value="$30,000 - $50,000">
                            $30,000 - $50,000
                          </option>
                          <option value="> $50,000">Above $50,000</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            {...methods.register("needsFinancialSupport")}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            I require financial support
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-800">
                      Required Documents
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          label: "CV / Resume",
                          name: "cv",
                          accept: ".pdf,.doc,.docx",
                        },
                        {
                          label: "Transcript",
                          name: "transcript",
                          accept: ".pdf",
                        },
                        {
                          label: "Degree Certificate",
                          name: "degreeCertificate",
                          accept: ".pdf",
                        },
                        {
                          label: "Language Certificate",
                          name: "languageCertificate",
                          accept: ".pdf",
                        },
                      ].map((doc) => (
                        <div
                          key={doc.name}
                          className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors group"
                        >
                          <input
                            type="file"
                            id={doc.name}
                            aria-label={doc.label}
                            accept={doc.accept}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                setValue(`documents.${doc.name}` as any, file);
                                toast.success(
                                  `${doc.label} uploaded successfully`,
                                );
                              }
                            }}
                          />
                          <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <p className="mt-2 text-sm font-medium text-gray-700">
                              {doc.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              Click to upload
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-800">
                      Notification Preferences
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...methods.register("notifications.email")}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          Email notifications
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...methods.register("notifications.sms")}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          SMS notifications
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...methods.register("notifications.inSystem")}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          In-app notifications
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6"
            >
              <ChevronLeft size={16} className="mr-2" />
              Previous
            </Button>

            {currentStep === STEPS.length ? (
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={!isDirty || !isValid}
                className="px-6"
              >
                Submit Profile
                <CheckCircle2 size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                className="px-6"
              >
                Next
                <ChevronRight size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
};
