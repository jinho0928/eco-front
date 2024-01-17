import { Button, styled } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function FileUploadButton({
  title,
  onChange,
  multiple = false,
}) {
  return (
    <Button
      component="label"
      variant="contained"
      startIcon={<CloudUploadIcon />}
      style={{ width: "150px", height: "40px" }}
    >
      {title}
      <VisuallyHiddenInput
        type="file"
        onChange={onChange}
        multiple={multiple}
        onClick={(e) => ((e.target as any).value = null)}
      />
    </Button>
  );
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
