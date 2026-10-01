import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Dropdown,
  NameField,
  NumberField,
  RadioButton,
  TextareaField,
  TextField,
} from "../../../components/controlled";
import FileUploadField from "../../../components/controlled/FileUploadField";

const CreateSchool: React.FC = () => {
  const { handleSubmit, control, watch, reset } = useForm({
    defaultValues: {
      schoolname: "",
      schoolcode: "",
      address: "",
      session: "",
      sessionStartMonth: "",
      sessionstartweek: "",
      schoolLogo: "",
      databaseName: "",
      defaultConnectionString: "yes",
      dbIpAddress: "",
      password: "",
      username: "",
      databaseType: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const defaultConnectionString = watch("defaultConnectionString");

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      console.log("Form Data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("School created successfully!");
      reset();
      scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error creating school:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    reset({
      schoolname: "",
      schoolcode: "",
      address: "",
      session: "",
      sessionStartMonth: "",
      sessionstartweek: "",
      schoolLogo: "",
      databaseName: "",
      defaultConnectionString: "yes",
      dbIpAddress: "",
      password: "",
      username: "",
      databaseType: "",
    });
    scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen  py-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="w-full mx-auto">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Create School
                </h1>
                <p className="text-gray-600 mt-1">
                  Super admin access required
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6 space-y-8">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Basic Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <NameField
                      name="schoolname"
                      placeholder="Enter school name"
                      label="School Name"
                      control={control}
                      required
                    />

                    <NumberField
                      name="schoolcode"
                      placeholder="Enter school Code"
                      label="School Code"
                      control={control}
                      required
                    />

                    <div className="md:col-span-2">
                      <TextareaField
                        name="address"
                        placeholder="Enter full address"
                        label="Address"
                        control={control}
                        rows={3}
                      />
                    </div>

                    <TextField
                      name="session"
                      placeholder="e.g., 2024-2025"
                      label="Session"
                      required
                      control={control}
                    />

                    <Dropdown
                      name="sessionStartMonth"
                      label="Session Start Month"
                      control={control}
                      options={[
                        { label: "January", value: "01" },
                        { label: "February", value: "02" },
                        { label: "March", value: "03" },
                        { label: "April", value: "04" },
                        { label: "May", value: "05" },
                        { label: "June", value: "06" },
                        { label: "July", value: "07" },
                        { label: "August", value: "08" },
                        { label: "September", value: "09" },
                        { label: "October", value: "10" },
                        { label: "November", value: "11" },
                        { label: "December", value: "12" },
                      ]}
                      required
                    />

                    <Dropdown
                      name="sessionstartweek"
                      label="Session Start Week"
                      control={control}
                      options={[
                        { label: "Monday", value: "01" },
                        { label: "Tuesday", value: "02" },
                        { label: "Wednesday", value: "03" },
                        { label: "Thursday", value: "04" },
                        { label: "Friday", value: "05" },
                        { label: "Saturday", value: "06" },
                        { label: "Sunday", value: "07" },
                      ]}
                      required
                    />

                    <div className="md:col-span-2">
                      <FileUploadField
                        name="schoolLogo"
                        label="School Logo"
                        control={control}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Database Configuration
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <NameField
                        name="databaseName"
                        placeholder="Enter database name"
                        label="Database Name"
                        control={control}
                        required
                      />

                      <div className="space-y-2">
                        <RadioButton
                          name="defaultConnectionString"
                          label="default Connection"
                          control={control}
                          options={[
                            { label: "Yes", value: "yes" },
                            { label: "No", value: "no" },
                          ]}
                          required
                        />
                      </div>
                    </div>

                    {defaultConnectionString === "no" && (
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6 animate-fadeIn">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Custom Database Connection
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <TextField
                            name="dbIpAddress"
                            placeholder="192.168.1.1"
                            label="DB IP Address"
                            control={control}
                          />

                          <TextField
                            name="username"
                            placeholder="Enter username"
                            label="Username"
                            control={control}
                            required
                          />

                          <TextField
                            name="password"
                            placeholder="Enter password"
                            label="Password"
                            control={control}
                            type="password"
                            required
                          />

                          <Dropdown
                            name="databaseType"
                            label="Database Type"
                            control={control}
                            options={[
                              { label: "MySQL", value: "mysql" },
                              { label: "PostgreSQL", value: "postgresql" },

                              { label: "SQL Server", value: "sqlserver" },
                              { label: "Oracle", value: "oracle" },
                            ]}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                  <Button
                    name="reset"
                    loading={false}
                    isDisable={isLoading}
                    onClick={handleReset}
                  />

                  <Button
                    name="Create School"
                    loading={isLoading}
                    isDisable={isLoading}
                    onClick={handleSubmit(onSubmit)}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSchool;
