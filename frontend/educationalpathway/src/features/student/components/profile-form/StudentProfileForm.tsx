"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
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
  Briefcase,
  Globe,
  DollarSign,
  Bell,
} from "lucide-react";
import Select, { MultiValue, SingleValue } from "react-select";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProfileFormValues } from "../../lib/profile-schema";
import { COUNTRY_PHONE_CODES } from "../../constants/country-phone-codes";
import { FIELDS_OF_STUDY_GROUPED } from "../../constants/fields-of-study";
import { useGeoData, CountryData, UniversityData } from "../../hooks/useGeoData";

const formatCountryOption = (option: any) => (
  <div className="flex items-center gap-2">
    {option.flag && (
      option.flag.endsWith(".svg") || option.flag.endsWith(".png") ? (
        <img src={option.flag} alt={`${option.label} flag`} className="w-5 h-3 object-cover shadow-sm border border-border" />
      ) : (
        <span>{option.flag}</span>
      )
    )}
    <span>{option.label}</span>
  </div>
);

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
  const [selectedPhoneCode, setSelectedPhoneCode] = useState<{ code: string; flag: string; iso: string } | null>(null);

  const methods = useForm<ProfileFormValues>({
    // resolver: zodResolver(profileSchema) as any, // disabled validation for now
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
    formState: { errors },
  } = methods;
  const countryOfResidence = watch("countryOfResidence");
  const watchedCountries = watch("preferredCountries") || [];

  const { countries, loadingCountries, getCitiesForCountry, getUniversitiesForCountry } = useGeoData();
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [availableUnis, setAvailableUnis] = useState<UniversityData[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [previousUnis, setPreviousUnis] = useState<UniversityData[]>([]);
  const [loadingPrevUnis, setLoadingPrevUnis] = useState(false);

  useEffect(() => {
    if (countryOfResidence) {
      setLoadingCities(true);
      setLoadingPrevUnis(true);
      
      Promise.all([
        getCitiesForCountry(countryOfResidence),
        getUniversitiesForCountry(countryOfResidence)
      ]).then(([cities, unis]) => {
        setAvailableCities(cities);
        setPreviousUnis(unis);
        setLoadingCities(false);
        setLoadingPrevUnis(false);
      });
    } else {
      setAvailableCities([]);
      setPreviousUnis([]);
    }
  }, [countryOfResidence]);

  useEffect(() => {
    if (watchedCountries.length > 0) {
      setLoadingUnis(true);
      const fetchAllUnis = async () => {
        const promises = watchedCountries.map((c) => getUniversitiesForCountry(c));
        const allUnis = await Promise.all(promises);
        setAvailableUnis(allUnis.flat());
        setLoadingUnis(false);
      };
      fetchAllUnis();
    } else {
      setAvailableUnis([]);
    }
  }, [watchedCountries.join(",")]);

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



  // const validateStep = async (step: number): Promise<boolean> => {
  //   const stepFields = STEPS[step - 1].fields as (keyof ProfileFormValues)[];
  //   const result = await trigger(stepFields);
  //   return result;
  // };

  const handleNext = async () => {
    // Validation removed for now
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <h1 className="h3 text-foreground">
              Complete Your Profile
            </h1>
            <span className="text-small">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full primary-gradient rounded-full"
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
                    type="button"
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
                          ? "primary-gradient text-primary-foreground ring-4 ring-primary/20"
                          : isCompleted
                          ? "bg-success text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                  </button>
                  <span className="text-small mt-2">
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > index + 1 ? "bg-success" : "bg-border"
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
          className="bg-card rounded-lg shadow-sm border border-border p-6"
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
                    <h2 className="h4 text-foreground flex items-center gap-2">
                      <User size={20} className="text-primary" />
                      Personal Details
                    </h2>
                    <p className="text-small mt-1">
                      {STEPS[0].description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-label">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
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
                      <label className="text-label">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
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
                      <label className="text-label">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        {/* Country code picker */}
                        <div className="w-44 shrink-0">
                          <Select
                            options={COUNTRY_PHONE_CODES.map((c) => ({
                              value: c.code,
                              label: `${c.flag} ${c.code}`,
                              flag: c.flag,
                              iso: c.iso,
                            }))}
                            onChange={(val) => {
                              if (val) {
                                setSelectedPhoneCode({ code: val.value, flag: (val as any).flag, iso: (val as any).iso });
                                const currentNum = methods.getValues("phoneNumber") || "";
                                const stripped = currentNum.replace(/^\+\d+\s*/, "");
                                setValue("phoneNumber", `${val.value} ${stripped}`);
                              }
                            }}
                            classNamePrefix="react-select"
                            placeholder="🌍 Code"
                            isSearchable
                            isClearable
                            formatOptionLabel={(opt: any) => (
                              <span className="flex items-center gap-1">
                                <span className="text-lg">{opt.flag}</span>
                                <span className="text-sm">{opt.value}</span>
                              </span>
                            )}
                          />
                        </div>
                        {/* Number input */}
                        <div className="relative flex-1">
                          {selectedPhoneCode && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">{selectedPhoneCode.flag}</span>
                          )}
                          {!selectedPhoneCode && (
                            <Phone
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                              size={18}
                            />
                          )}
                          <Input
                            {...methods.register("phoneNumber")}
                            placeholder="912 345 6789"
                            className={selectedPhoneCode ? "pl-10" : "pl-10"}
                            error={errors.phoneNumber?.message}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1">
                      <label className="text-label">
                        Date of Birth <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
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
                      <label className="text-label">
                        Gender
                      </label>
                      <select
                        {...methods.register("gender")}
                        className="w-full h-10 px-3 bg-muted border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
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
                      <label className="text-label">
                        Nationality <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Flag
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10"
                          size={18}
                        />
                        <Select
                          options={countries.map((c) => ({
                            value: c.name,
                            label: c.name,
                            flag: c.flag,
                          }))}
                          onChange={(
                            val: SingleValue<{ value: string; label: string; flag: string }>,
                          ) => setValue("nationality", val?.value || "")}
                          className="pl-7"
                          classNamePrefix="react-select"
                          placeholder={loadingCountries ? "Loading..." : "Select nationality"}
                          isDisabled={loadingCountries}
                          formatOptionLabel={formatCountryOption}
                          isClearable
                        />
                      </div>
                    </div>

                    {/* Country of Residence */}
                    <div className="space-y-1">
                      <label className="text-label">
                        Country of Residence{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <MapPin
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10"
                          size={18}
                        />
                        <Select
                          options={countries.map((c) => ({
                            value: c.name,
                            label: c.name,
                            flag: c.flag,
                          }))}
                          onChange={(
                            val: SingleValue<{ value: string; label: string; flag: string }>,
                          ) => setValue("countryOfResidence", val?.value || "")}
                          className="pl-7"
                          classNamePrefix="react-select"
                          placeholder={loadingCountries ? "Loading..." : "Select country"}
                          isDisabled={loadingCountries}
                          formatOptionLabel={formatCountryOption}
                          isClearable
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-1">
                      <label className="text-label">
                        City <span className="text-destructive">*</span>
                      </label>
                      <Select
                        options={availableCities.map((city) => ({
                          value: city,
                          label: city,
                        }))}
                        isDisabled={!countryOfResidence || loadingCities}
                        onChange={(val: SingleValue<{ value: string; label: string }>) =>
                          setValue("city", val?.value || "")
                        }
                        classNamePrefix="react-select"
                        placeholder={
                          loadingCities
                            ? "Loading cities..."
                            : !countryOfResidence
                            ? "Select country first"
                            : availableCities.length
                            ? "Select city"
                            : "Type your city below"
                        }
                        isClearable
                        isSearchable
                        noOptionsMessage={() =>
                          loadingCities
                            ? "Loading..."
                            : countryOfResidence
                            ? "No preset cities — type in the field below"
                            : "Select a country first"
                        }
                      />
                      {/* Fallback text input when country has no preset cities */}
                      {countryOfResidence && !loadingCities && availableCities.length === 0 && (
                        <div className="relative mt-1">
                          <MapPin
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            size={18}
                          />
                          <Input
                            {...methods.register("city")}
                            placeholder="Enter your city"
                            className="pl-10"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Background */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="h4 text-foreground flex items-center gap-2">
                      <GraduationCap size={20} className="text-primary" />
                      Academic Background
                    </h2>
                    <p className="text-small mt-1">
                      {STEPS[1].description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Education Level */}
                    <div className="space-y-1">
                      <label className="text-label">
                        Current Education Level{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <select
                        {...methods.register("currentEducationLevel")}
                        className="w-full h-10 px-3 bg-muted border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
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
                      <label className="text-label">
                        Degree Seeking <span className="text-destructive">*</span>
                      </label>
                      <select
                        {...methods.register("degreeSeeking")}
                        className="w-full h-10 px-3 bg-muted border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                      >
                        <option value="">Select degree</option>
                        <option value="Bachelor's">Bachelor&apos;s</option>
                        <option value="Master's">Master&apos;s</option>
                        <option value="PhD">PhD</option>
                      </select>
                    </div>

                    {/* Field of Study */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-label">
                        Field of Study <span className="text-destructive">*</span>
                      </label>
                      <Select
                        isMulti
                        options={FIELDS_OF_STUDY_GROUPED as any}
                        onChange={(
                          val: MultiValue<{ value: string; label: string }>,
                        ) =>
                          setValue(
                            "fieldOfStudyInput",
                            val.map((v) => v.value),
                          )
                        }
                        classNamePrefix="react-select"
                        placeholder="Search and select fields of study..."
                        isSearchable
                        closeMenuOnSelect={false}
                      />
                    </div>

                    {/* Previous University */}
                    <div className="space-y-1">
                      <label className="text-label">
                        Previous University
                      </label>
                      <Select
                        options={previousUnis.map((u) => ({
                          value: u.name,
                          label: u.name,
                        }))}
                        onChange={(
                          val: SingleValue<{ value: string; label: string }>,
                        ) => setValue("previousUniversity", val?.value || "")}
                        isDisabled={!countryOfResidence || loadingPrevUnis}
                        classNamePrefix="react-select"
                        placeholder={
                          loadingPrevUnis
                            ? "Loading universities..."
                            : !countryOfResidence
                            ? "Select Country of Residence first"
                            : "Search universities..."
                        }
                        isClearable
                        isSearchable
                      />
                    </div>

                    {/* Graduation Year */}
                    <div className="space-y-1">
                      <label className="text-label">
                        Graduation Year
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
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
                      <label className="text-label">
                        GPA
                      </label>
                      <div className="relative">
                        <Award
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
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
                      <label className="text-label">
                        Language Test
                      </label>
                      <select
                        {...methods.register("languageTestType")}
                        className="w-full h-10 px-3 bg-muted border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
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
                        <label className="text-label">
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
                      <label className="text-label">
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
                    <h2 className="h4 text-foreground flex items-center gap-2">
                      <FileText size={20} className="text-primary" />
                      Preferences & Documents
                    </h2>
                    <p className="text-small mt-1">
                      {STEPS[2].description}
                    </p>
                  </div>

                  {/* Study Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-md font-semibold text-foreground">
                      Study Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Preferred Degree Levels */}
                      <div className="space-y-1">
                        <label className="text-label">
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
                          classNamePrefix="react-select"
                          placeholder="Select degree levels"
                        />
                      </div>

                      {/* Funding Type */}
                      <div className="space-y-1">
                        <label className="text-label">
                          Funding Type
                        </label>
                        <select
                          {...methods.register("preferredFundingType")}
                          className="w-full h-10 px-3 bg-muted border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
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
                        <label className="text-label">
                          Study Mode
                        </label>
                        <select
                          {...methods.register("studyMode")}
                          className="w-full h-10 px-3 bg-muted border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
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
                    <h3 className="text-md font-semibold text-foreground">
                      Preferred Destinations
                    </h3>
                    <div className="space-y-1">
                      <label className="text-label">
                        Preferred Countries
                      </label>
                      <Select
                        isMulti
                        options={countries.map((c) => ({
                          value: c.name,
                          label: c.name,
                          flag: c.flag,
                        }))}
                        onChange={(
                          val: MultiValue<{ value: string; label: string; flag: string }>,
                        ) =>
                          setValue(
                            "preferredCountries",
                            val.map((v) => v.value),
                          )
                        }
                        classNamePrefix="react-select"
                        placeholder={loadingCountries ? "Loading..." : "Select countries"}
                        isDisabled={loadingCountries}
                        formatOptionLabel={formatCountryOption}
                      />
                    </div>

                    {/* Preferred Universities */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-label">
                          Preferred Universities
                        </label>
                        <Select
                          options={watchedCountries.map(c => ({
                            label: c,
                            options: availableUnis
                              .filter(u => u.country.toLowerCase() === c.toLowerCase())
                              .map(u => ({
                                value: u.name,
                                label: u.name,
                                country: c
                              }))
                          })).filter(g => g.options.length > 0)}
                          value={null}
                          onChange={(val: any) => {
                            if (val) {
                              // Check if already added
                              const exists = methods.getValues("preferredUniversities")?.some(u => u.name === val.value);
                              if (!exists) {
                                appendUni({
                                  name: val.value,
                                  country: val.country,
                                  preferenceLevel: "Medium",
                                });
                              } else {
                                toast.error(`${val.value} is already added`);
                              }
                            }
                          }}
                          placeholder={
                            loadingUnis ? "Loading universities..."
                            : watchedCountries.length ? "Select university..." : "Select countries first"
                          }
                          isDisabled={watchedCountries.length === 0 || loadingUnis}
                          classNamePrefix="react-select"
                          isSearchable
                        />
                      </div>                      {uniFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-start gap-3 p-4 bg-muted rounded-lg border border-border"
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                            <div className="col-span-2">
                              {methods.watch(`preferredUniversities.${index}.name`) ? (
                                <div>
                                  <p className="font-medium text-sm text-foreground">
                                    {methods.watch(`preferredUniversities.${index}.name`)}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {methods.watch(`preferredUniversities.${index}.country`)}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">New University (Please re-add)</p>
                              )}
                            </div>
                            <div className="w-full">
                              <select
                                {...methods.register(
                                  `preferredUniversities.${index}.preferenceLevel`,
                                )}
                                aria-label="Preference level"
                                className="w-full h-10 px-3 bg-muted border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
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
                            className="text-muted-foreground hover:text-destructive transition-colors"
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
                      <h3 className="text-md font-semibold text-foreground">
                        Work Experience
                      </h3>
                      <div className="w-48 text-sm">
                        <Select
                          options={[
                            { value: "Internship", label: "+ Internship" },
                            { value: "Part-time Job", label: "+ Part-time Job" },
                            { value: "Full-time Job", label: "+ Full-time Job" },
                            { value: "Volunteer", label: "+ Volunteer Role" },
                            { value: "Research Assistant", label: "+ Research Assistant" },
                            { value: "Teaching Assistant", label: "+ Teaching Assistant" },
                            { value: "Other", label: "+ Other Experience" },
                          ]}
                          value={null}
                          onChange={(val: any) => {
                            if (val) {
                              appendWork({
                                organizationName: "",
                                jobTitle: val.value === "Other" ? "" : val.value,
                                yearsOfExperience: 0,
                              });
                            }
                          }}
                          placeholder="+ Add Experience"
                          classNamePrefix="react-select"
                          isSearchable={false}
                        />
                      </div>
                    </div>

                    {workFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-start gap-3 p-4 bg-muted rounded-lg border border-border"
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
                          <select
                            {...methods.register(
                              `workExperience.${index}.yearsOfExperience`,
                              { valueAsNumber: true },
                            )}
                            aria-label="Years of experience"
                            className="bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="0">Less than 1 year</option>
                            <option value="1">1 year</option>
                            <option value="2">2 years</option>
                            <option value="3">3 years</option>
                            <option value="4">4 years</option>
                            <option value="5">5+ years</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWork(index)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Remove work experience"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Financial Information */}
                  <div className="space-y-4">
                    <h3 className="text-md font-semibold text-foreground">
                      Financial Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-label">
                          Family Income Range
                        </label>
                        <select
                          {...methods.register("familyIncomeRange")}
                          className="w-full h-10 px-3 bg-muted border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
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
                            className="w-4 h-4 text-primary rounded border-input focus:ring-ring"
                          />
                          <span className="text-sm font-medium text-foreground">
                            I require financial support
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="space-y-4">
                    <h3 className="text-md font-semibold text-foreground">
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
                          className="relative border-2 border-dashed border-input rounded-lg p-4 hover:border-primary transition-colors group bg-muted/50"
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
                                setValue(`documents.${doc.name}` as any, file);
                                toast.success(
                                  `${doc.label} uploaded successfully`,
                                );
                              }
                            }}
                          />
                          <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <p className="mt-2 text-sm font-medium text-foreground">
                              {doc.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Click to upload
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-md font-semibold text-foreground">
                      Notification Preferences
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...methods.register("notifications.email")}
                          className="w-4 h-4 text-primary rounded border-input focus:ring-ring"
                        />
                        <span className="text-sm text-foreground">
                          Email notifications
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...methods.register("notifications.sms")}
                          className="w-4 h-4 text-primary rounded border-input focus:ring-ring"
                        />
                        <span className="text-sm text-foreground">
                          SMS notifications
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...methods.register("notifications.inSystem")}
                          className="w-4 h-4 text-primary rounded border-input focus:ring-ring"
                        />
                        <span className="text-sm text-foreground">
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
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
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
                key="submit-btn"
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="px-6"
              >
                Submit Profile
                <CheckCircle2 size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                key="next-btn"
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