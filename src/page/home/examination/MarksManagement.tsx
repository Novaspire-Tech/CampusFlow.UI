import { useState, useMemo, type ChangeEvent } from "react";
import { useForm, type SubmitHandler, useFieldArray } from "react-hook-form";
import { Button, Dropdown } from "../../../components/controlled";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import { IconField } from "../../../components";

/*  TYPES  */

interface SearchFormInputs {
  class: string;
  section?: string;
  subjectGroupId?: string;
}

interface SubjectMarkEntry {
  subjectId: number;
  subjectName: string;
  outOfMarks: string;
  actualMarks: string;
}

interface ModalFormInputs {
  examGroupId: string;
  marks: SubjectMarkEntry[];
}

interface Student {
  id: number;
  admissionNo: string;
  studentName: string;
  class: string;
  section: string;
  rollNo: string;

  examGroupId?: string;
  examGroupName?: string;
  marks?: SubjectMarkEntry[];
  marksSummary?: string;
  totalScore?: string;
}

/*  DUMMY DATA  */

const CLASSES = ["Class 1", "Class 2"];
const SECTIONS = ["A", "B"];

const SUBJECT_GROUPS = [
  {
    id: "1",
    name: "Science Group",
    class: "Class 1",
    subjects: [
      { id: 1, subjectName: "English" },
      { id: 2, subjectName: "Maths" },
    ],
  },
];

const EXAM_GROUPS = [
  { id: "1", name: "Final Exam" },
  { id: "2", name: "Mid Term" },
];

const STUDENTS: Student[] = [
  {
    id: 1,
    admissionNo: "101",
    studentName: "Priya Bahiru Pisal",
    class: "Class 1",
    section: "A",
    rollNo: "1",
  },
  {
    id: 2,
    admissionNo: "102",
    studentName: "Priti Sudam Pisal",
    class: "Class 1",
    section: "A",
    rollNo: "2",
  },
  {
    id: 3,
    admissionNo: "103",
    studentName: "Nikita Sunil Kanse",
    class: "Class 1",
    section: "A",
    rollNo: "3",
  },
];

/*  COMPONENT  */

const MarksManagement = () => {
  const {
    control: searchControl,
    handleSubmit: handleSearchSubmit,
    watch,
  } = useForm<SearchFormInputs>();

  const {
    control: modalControl,
    handleSubmit: handleModalSubmit,
    reset,
    register,
  } = useForm<ModalFormInputs>({
    defaultValues: { examGroupId: "", marks: [] },
  });

  const { fields, replace } = useFieldArray({
    control: modalControl,
    name: "marks",
  });

  const selectedClass = watch("class");
  const selectedSubjectGroupId = watch("subjectGroupId");

  const [students] = useState<Student[]>(STUDENTS);
  const [results, setResults] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const subjectGroupOptions = useMemo(
    () =>
      SUBJECT_GROUPS.filter((g) => g.class === selectedClass).map((g) => ({
        label: g.name,
        value: g.id,
      })),
    [selectedClass]
  );

  const examGroupOptions = EXAM_GROUPS.map((g) => ({
    label: g.name,
    value: g.id,
  }));

  const onSearchSubmit: SubmitHandler<SearchFormInputs> = (data) => {
    setResults(
      students.filter(
        (s) =>
          s.class === data.class &&
          (!data.section || s.section === data.section)
      )
    );
  };

  const handleAdd = (id: number| string) => {
    const student = results.find((s) => s.id === id);
    if (!student) return;

    if (!selectedSubjectGroupId) {
      setErrorMessage("Please select Subject Group first");
      return;
    }

    const group = SUBJECT_GROUPS.find(
      (g) => g.id === selectedSubjectGroupId
    );

    if (!group) return;

    const marks =
      student.marks && student.marks.length
        ? student.marks
        : group.subjects.map((s) => ({
            subjectId: s.id,
            subjectName: s.subjectName,
            outOfMarks: "",
            actualMarks: "",
          }));

    setSelectedStudent(student);
    reset({ examGroupId: student.examGroupId || "", marks });
    replace(marks);
    setShowModal(true);
    setErrorMessage("");
  };

  const onFinalSubmit: SubmitHandler<ModalFormInputs> = (data) => {
    if (!selectedStudent) return;

    const examName =
      EXAM_GROUPS.find((e) => e.id === data.examGroupId)?.name || "";

    const summary = data.marks
      .map((m) => `${m.subjectName}: ${m.actualMarks}/${m.outOfMarks}`)
      .join(", ");

    const totalActual = data.marks.reduce(
      (s, m) => s + Number(m.actualMarks || 0),
      0
    );
    const totalOut = data.marks.reduce(
      (s, m) => s + Number(m.outOfMarks || 0),
      0
    );

    setResults((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              examGroupId: data.examGroupId,
              examGroupName: examName,
              marks: data.marks,
              marksSummary: summary,
              totalScore: `${totalActual}/${totalOut}`,
            }
          : s
      )
    );

    setShowModal(false);
    setSelectedStudent(null);
    reset();
  };

  const columns = [
    { label: "Admission No", key: "admissionNo" },
    { label: "Student Name", key: "studentName" },
    { label: "Exam Group", key: "examGroupName" },
    { label: "Subject Marks", key: "marksSummary" },
    { label: "Total", key: "totalScore" },
    { label: "Roll No", key: "rollNo" },
  ];

  const filteredResults = results.filter((s) =>
    [s.studentName, s.admissionNo]
      .some((v) => v.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 p-4">
      {errorMessage && (
        <div className="bg-red-100 text-red-600 p-3 rounded">
          {errorMessage}
        </div>
      )}

      <div className="bg-white border rounded p-4">
        <div className="grid grid-cols-3 gap-4">
          <Dropdown label="Class" name="class" control={searchControl} options={CLASSES} required />
          <Dropdown label="Section" name="section" control={searchControl} options={SECTIONS} />
          <Dropdown
            label="Subject Group"
            name="subjectGroupId"
            control={searchControl}
            options={subjectGroupOptions}
            required
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button name="Search" icon={<IconField name="FaSearch" />} onClick={handleSearchSubmit(onSearchSubmit)} loading={false} />
        </div>
      </div>

      {results.length > 0 && (
        <ControlledTable
          title="Student List"
          columns={columns}
          data={filteredResults}
          searchTerm={searchTerm}
          onSearchChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          onAdd={handleAdd}
          btn={false}
        />
      )}

      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white w-full max-w-3xl rounded shadow">
            <div className="p-4 border-b font-bold">
              Add Marks: {selectedStudent.studentName}
            </div>

            <div className="p-4 space-y-4">
              <Dropdown
                label="Exam Group"
                name="examGroupId"
                control={modalControl}
                options={examGroupOptions}
                required
              />

              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Subject</th>
                    <th className="border p-2">Out Of</th>
                    <th className="border p-2">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f, i) => (
                    <tr key={f.id}>
                      <td className="border p-2">{f.subjectName}</td>
                      <td className="border p-2">
                        <input
                          type="number"
                          className="w-full border p-1"
                          {...register(`marks.${i}.outOfMarks`)}
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          className="w-full border p-1"
                          {...register(`marks.${i}.actualMarks`)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <Button name="Cancel" onClick={() => setShowModal(false)} loading={false} />
              <Button
                name="Save All Data"
                icon={<IconField name="FaCheck" />}
                onClick={handleModalSubmit(onFinalSubmit)} loading={false}              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksManagement;
 