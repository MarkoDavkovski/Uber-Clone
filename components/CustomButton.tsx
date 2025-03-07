import { ButtonProps } from "@/types/type";
import { Text, TouchableOpacity } from "react-native";
const getBgVariantStyle = (
  variant: ButtonProps["bgVariant"],
  disabled: boolean
) => {
  if (disabled) {
    return "bg-gray-200 opacity-50";
  }
  switch (variant) {
    case "primary":
      return "bg-blue-500";
    case "secondary":
      return "bg-gray-500 ";
    case "success":
      return "bg-green-500";
    case "outline":
      return "bg-transparent border-neutral-300 border-[0.5px]";
    case "danger":
      return "bg-red-500";
    default:
      return "bg-[#0286ff]";
  }
};
const getTextVariantStyle = (
  variant: ButtonProps["textVariant"],
  disabled: boolean
) => {
  if (disabled) return "text-gray-500";
  switch (variant) {
    case "primary":
      return "text-black";
    case "secondary":
      return "text-gray-100";
    case "success":
      return "text-green-100";
    case "danger":
      return "<text-red-1></text-red-1>00";
    default:
      return "text-white";
  }
};
const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className,
  disabled = false,
  loading = false,
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={!disabled ? onPress : undefined}
      className={`w-full p-3 rounded-full flex flex-row justify-center items-center shadow-md shadow-neutral-400/70 ${getBgVariantStyle(bgVariant, disabled)} ${className}`}
      {...props}>
      {IconLeft && <IconLeft />}
      <Text
        className={`text-lg font-bold ${getTextVariantStyle(textVariant, disabled)}`}>
        {title}
      </Text>
      {IconRight && <IconRight />}
    </TouchableOpacity>
  );
};

export default CustomButton;
