import React from "react";
import { Button, Logo, RadioButton } from "../../components/controlled";
import { useForm, type SubmitHandler } from "react-hook-form";
import OfficeNumber from "../../components/controlled/OfficeNumber";
import Dropdown from "../../components/controlled/Dropdown";

type FormValues = {
  ConnectionString: "Yes" | "No";
  password: String;
};

const Organisation: React.FC = () => {
  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      ConnectionString: "Yes",
    },
  });

  const ConnectionStringValue = watch("ConnectionString");

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
  };
  return (
    <div className="p-4">
      <div className="p-5 m-5 border border-gray-300 rounded-xl shadow-2xl max-w-md mx-auto md:max-w-lg lg:max-w-2xl font-normal ">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="md:font-bold lg:font-bold font-medium md:text-3xl text-2xl text-center text-blue-700 text-shadow-lg">
            Organisation Page
          </h2>

          <div className="flex flex-col items-center mt-2">
            <Logo name="OrganisationLogo" control={control} required />
          </div>

          <OfficeNumber name="OfficeNumber" label="Office Number" control={control} required />

          <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1">
            <RadioButton
              name="ConnectionString"
              label="Default Connection String"
              required
              control={control}
              options={[
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
              ]}
            />
          </div>

          {ConnectionStringValue === "No" && (
            <>
              <Dropdown
                name="DataBaseType"
                label="DataBase Type"
                control={control}
                required 
                options={[
                  { label: "MYSQL", value: "MySql" },
                  { label: "PostgreSQL", value: "PostgreSql" },
                  { label: "MSSQL", value: "MsSql" },
                  { label: "Oracle", value: "Oracle" },
                  { label: "Others", value: "Others" },
                ]}
              />
            </>
          )}

          <div className="flex justify-end">
            <Button name="Register" loading={false} clr="blue" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Organisation;
