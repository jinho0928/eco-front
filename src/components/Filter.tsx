import { styled } from "@mui/material";
import {
  DatePicker as MuiDatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { Observer } from "mobx-react";

export function Filter({
  start,
  end,
  onStartChange,
  onEndChange,
  children,
}) {
  const handleDateChange = (key) => (newValue) => {
    if (key === "start") onStartChange(newValue);
    if (key === "end") onEndChange(newValue);
  };

  return (
    <Wrapper>
      <div className="filter__date-pickers">
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <strong>조회기간</strong>
          <Observer>
            {() => (
              <DatePicker value={start} onChange={handleDateChange("start")} />
            )}
          </Observer>
          <strong>~</strong>
          <Observer>
            {() => (
              <DatePicker value={end} onChange={handleDateChange("end")} />
            )}
          </Observer>
        </LocalizationProvider>
      </div>
      <div className='filter__rightside'>
        {children}
      </div>
    </Wrapper>
  );
}

const Wrapper = styled("div")`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid #e1e1e1;

  strong {
    color: #595959;
  }

  .filter__date-pickers {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filter__rightside{
    display:flex;
    gap: 10px;
  }
`;

const DatePicker = styled(MuiDatePicker)`
  width: 200px;
  .MuiInputBase-input {
    padding: 8px 14px;
  }
`;
