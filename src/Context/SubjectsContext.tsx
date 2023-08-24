import { createContext } from 'react';
import { Subject, SubjectRole } from '../Types/types';

type SubjectsContextType = {
    subjects: Subject[];
    setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
    subjectRoles: SubjectRole[];
    setSubjectRoles: React.Dispatch<React.SetStateAction<SubjectRole[]>>;
};

export const SubjectsContext = createContext<SubjectsContextType>({
    subjects: [],
    setSubjects: () => {},
    subjectRoles: [],
    setSubjectRoles: () => {},
});


