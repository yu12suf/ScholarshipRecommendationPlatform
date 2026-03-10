import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-context';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '@/lib/api';
import { 
  extractData, 
  verifyIdentity, 
  updateProfile 
} from '../api/onboarding-api';
import { ExtractedData, StudentExtractedData, CounselorExtractedData } from '../types';

export const useOnboarding = () => {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    if (e.target.files?.[0]) {
      setFiles({ ...files, [name]: e.target.files[0] });
    }
  };

  const handleStage1 = async () => {
    if (!files.document) {
      toast.error('Please upload your document');
      return;
    }

    setLoading(true);
    try {
      const data = await extractData(files.document, user?.role || 'student');
      setExtractedData(data);
      toast.success('Done!');
      setStep(2);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleStage2 = async () => {
    if (!files.idCard || !files.selfie) {
      toast.error('Please upload your ID and selfie');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyIdentity(files.idCard, files.selfie);
      
      if (result.success) {
        toast.success('Verified!');
        setStep(3);
      } else {
        toast.error('Does not match. Try again.');
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleStage3 = async () => {
    setLoading(true);
    try {
      const payload = user?.role === 'student' 
        ? {
            calculatedGpa: (extractedData as StudentExtractedData)?.gpa || 3.5,
            academicHistory: (extractedData as StudentExtractedData)?.academic_history || [],
          }
        : {
            bio: (extractedData as CounselorExtractedData)?.bio || "",
            areasOfExpertise: (extractedData as CounselorExtractedData)?.areas_of_expertise || [],
            yearsOfExperience: (extractedData as CounselorExtractedData)?.years_of_experience || 0,
          };

      await updateProfile(payload);
      
      updateUser({ isOnboarded: true });
      toast.success('Welcome!');
      router.push('/dashboard');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Final update failed'));
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    loading,
    files,
    extractedData,
    handleFileChange,
    handleStage1,
    handleStage2,
    handleStage3,
    user
  };
};
