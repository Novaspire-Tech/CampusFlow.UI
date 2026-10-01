import  {  type FC } from "react";
import { Controller,type Control,type FieldPath,type FieldValues } from "react-hook-form";
import { USER, PHONE_NUMBER, EMAIL } from '../../constants/RegexPattern';
import Label from "../Label";
import Error from "./Error";

interface Props {
    name: FieldPath<FieldValues>;
    label?: string;
    control: Control<FieldValues>;
    required?: boolean;
    placeholder?: string;
    setChangeBtn?: (value: boolean) => void;
    FieldRequired?: boolean;
}

const User: FC<Props> = ({ name, label, control, placeholder, setChangeBtn, required = false, FieldRequired = false, ...rest}) => {

    const FindType = (value: string) => {
        if (/^\d+$/.test(value)) {
            if (setChangeBtn) {
                setChangeBtn(true)
            }
            return "Phone";
        }
        if (value.includes("@")) {
            if (setChangeBtn) {
                setChangeBtn(false)
            }
            return "Email";
        }
        if (setChangeBtn) {
            setChangeBtn(false)
        }
        return "UserId";
    };

    return (
        <div className="mb-2">
                {label && (
                   <Label label={label} required={required} labelClassName="mb-1" />
                 )}
            <Controller
                name={name}
                control={control}
                rules={{
                    validate: (value: string) => {
                        const type = FindType(value);

                        if (!FieldRequired) {
                            if (type === "Email") {
                                return EMAIL.test(value)
                                    ? true
                                    : "Please enter a valid email address";
                            }

                            if (type === "UserId") {
                                if (value.length < 3 || value.length > 20) {
                                    return "User ID must be 3–20 characters";
                                }

                                return USER.test(value)
                                    ? true
                                    : "User ID can only contain letters, numbers, underscores";
                            }
                        }
                        if (type === "Phone") {
                                return PHONE_NUMBER.test(value)
                                    ? true
                                    : "Please enter a valid 10 digit phone number";
                            }

                        return true;
                    } ,
                }}
                render={({ field, fieldState: { error }}) => (
                    <div>
                        <input
                            {...field}
                            {...rest}
                            placeholder={placeholder}
                            id={name}
                            type="text"
                            onChange={(e) => {
                                const val = e.target.value;
                                FindType(val) 
                                field.onChange(e);
                            }}
                            className={`mt-1 block w-full px-4 py-2 border ${error ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm`}/>

                       {error && (
                               <Error error={error}/>
                           )}

                    </div>
                )}
            />
        </div>
    );


};

export default User;


