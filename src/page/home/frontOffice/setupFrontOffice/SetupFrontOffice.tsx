import { Routes, Route, Navigate } from "react-router-dom";
import Purpose from "./Purpose";
import ComplaintType from "./ComplaintType";
import Source from "./Source";
import Reference from "./Reference";
import Setup from "./Setup";

const SetupFrontOffice = () => {
  return (
    <Routes>
      <Route path="/" element={<Setup />}>
        <Route index element={<Navigate to="purpose" replace />} />
        <Route path="purpose" element={<Purpose />} />
        <Route path="complaint-type" element={<ComplaintType />} />
        <Route path="source" element={<Source />} />
        <Route path="reference" element={<Reference />} />
      </Route>
    </Routes>
  );
};

export default SetupFrontOffice;
