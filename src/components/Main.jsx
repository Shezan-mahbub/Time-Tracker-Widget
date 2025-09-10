
import * as React from "react";
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Button,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import SearchIcon from "@mui/icons-material/Search";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";

export default function TimeEntryFormCompactGrid2() {
  const remarksOptions = ["-None-", "Warte auf Rückmeldung", "Wiederholt keine Rückmeldung"];
  const businessAreas = ["eDSB", "IT", "HR", "Finance"];
  const owners = ["Mike Peter", "Anna Weber", "Jonas Müller"];

  const [formData, setFormData] = React.useState({
    zeiterfassungName: "",
    aufgaben: "",
    startDateTime: null,
    endDateTime: null,
    dauer: "",
    bemerkungen: "-None-",
    owner: "",
    businessAreaLeft: "",
    businessAreaRight: "",
  });

  const setField = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    const payload = {
      ...formData,
      startDateTimeISO: formData.startDateTime ? dayjs(formData.startDateTime).toISOString() : null,
      endDateTimeISO: formData.endDateTime ? dayjs(formData.endDateTime).toISOString() : null,
    };
    console.log("SAVE payload:", formData);
    alert("Check console for saved object");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Zeiterfassung
        </Typography>

        <Grid2 container spacing={1.5}>
          {/* Left column */}
          <Grid2 size={6} container spacing={1.5}>
            <Grid2 size={12}>
              <TextField
                fullWidth
                size="small"
                label="Zeiterfassung Name"
                value={formData.zeiterfassungName}
                onChange={(e) => setField("zeiterfassungName", e.target.value)}
              />
            </Grid2>

 

            <Grid2 size={12}>
              <DateTimePicker
                label="Start_Zeit"
                value={formData.startDateTime}
                onChange={(v) => setField("startDateTime", v)}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Grid2>

            <Grid2 size={12}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Dauer"
                placeholder="0"
                value={formData.dauer}
                onChange={(e) => setField("dauer", e.target.value)}
                inputProps={{ min: 0 }}
              />
            </Grid2>

            <Grid2 size={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Bemerkungen</InputLabel>
                <Select
                  label="Bemerkungen"
                  value={formData.bemerkungen}
                  onChange={(e) => setField("bemerkungen", e.target.value)}
                >
                  {remarksOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>

          {/* Right column */}
          <Grid2 size={6} container spacing={1.5}>
            <Grid2 size={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Zeiterfassung Owner</InputLabel>
                <Select
                  label="Zeiterfassung Owner"
                  value={formData.owner}
                  onChange={(e) => setField("owner", e.target.value)}
                >
                  {owners.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>

            <Grid2 size={12}>
              <DateTimePicker
                label="End_Zeit"
                value={formData.endDateTime}
                onChange={(v) => setField("endDateTime", v)}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Grid2>

            <Grid2 size={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Business Area</InputLabel>
                <Select
                  label="Business Area"
                  value={formData.businessAreaLeft}
                  onChange={(e) => setField("businessAreaLeft", e.target.value)}
                >
                  {businessAreas.map((b) => (
                    <MenuItem key={b} value={b}>
                      {b}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>

            <Grid2 size={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Business_Area</InputLabel>
                <Select
                  label="Business_Area"
                  value={formData.businessAreaRight}
                  onChange={(e) => setField("businessAreaRight", e.target.value)}
                >
                  {businessAreas.map((b) => (
                    <MenuItem key={b} value={b}>
                      {b}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>

          {/* Actions */}
          <Grid2 size={12} display="flex" justifyContent="flex-end" gap={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                setFormData({
                  zeiterfassungName: "",
                  aufgaben: "",
                  startDateTime: null,
                  endDateTime: null,
                  dauer: "",
                  bemerkungen: "-None-",
                  owner: "",
                  businessAreaLeft: "",
                  businessAreaRight: "",
                })
              }
            >
              Reset
            </Button>
            <Button size="small" variant="contained" onClick={handleSave}>
              Save
            </Button>
          </Grid2>

   
        </Grid2>
      </Paper>
    </LocalizationProvider>
  );
}
