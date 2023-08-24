import { Subject } from "../Types/types";
import { createContext } from 'react';



type SelectedSubjectContextType = {
    selectedSubject: Subject | null;
    setSelectedSubject: React.Dispatch<React.SetStateAction<Subject | null>>;
};

export const SelectedSubjectContext = createContext<SelectedSubjectContextType>({
    selectedSubject: null,
    setSelectedSubject: () => {},
});
