import * as React from "react";
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Typography,
  Snackbar, // Added Snackbar
  Divider,
  FormHelperText,
  Checkbox,
  ListItemText,
  Chip,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
const ZOHO = window.ZOHO;
export default function Main({ setFormData, formData, Create_new_time_record, setShowMain }) {
  const remarksOptions = ["Warte auf Rückmeldung", "Wiederholt keine Rückmeldung"];
  const businessAreas = ["eDSB", "eISB", "27001", "DSGVO-Compliance"];
  const [errors, setErrors] = React.useState({
    Name: false,
    Start_Zeit: false,
    End_Zeit: false,
  });

  const [openSnackbar, setOpenSnackbar] = React.useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = React.useState(""); // Snackbar message

  const handleCreate = () => {
    const start = formData.Start_Zeit ? dayjs(formData.Start_Zeit) : null;
    const end = formData.End_Zeit ? dayjs(formData.End_Zeit) : null;
    const endRelationInvalid = start && end ? !end.isAfter(start) : false;

    const newErrors = {
      Name: !formData.Name,
      Start_Zeit: !formData.Start_Zeit,
      End_Zeit: !formData.End_Zeit || endRelationInvalid, // mark as error if missing or not after start
    };

    setErrors(newErrors);

    // block create if any error or if end is not after start
    if (!Object.values(newErrors).some(Boolean)) {
      console.log("Form Data before creation", formData);
      Create_new_time_record(formData);

      // Show Snackbar message
      setSnackbarMessage("Successfully created Zeiterfassung Record!");
      setOpenSnackbar(true);

      // Reload the widget after 10 seconds
      setTimeout(() => {
        // Reload the widget
       ZOHO.CRM.UI.Popup.closeReload()
.then(function(data){
    console.log(data)
})
      }, 5000); // 10 seconds delay
    }
  };

  const setField = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  // right above return (or inside the component before JSX)
  const startDJ = formData.Start_Zeit ? dayjs(formData.Start_Zeit) : null;
  const endDJ = formData.End_Zeit ? dayjs(formData.End_Zeit) : null;
  const endRelationInvalid = startDJ && endDJ ? !endDJ.isAfter(startDJ) : false;

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", px: 2 }}>
      <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto" }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Paper
            sx={{
              p: 3,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              backgroundColor: "#fff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Zeiterfassung
              </Typography>
              <Button variant="contained" onClick={() => setShowMain(false)}>
                Time Records
              </Button>
            </Box>

            <Grid2 container spacing={1.5}>
              {/* Left column */}
              <Grid2 size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: "grid", gap: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Zeiterfassung Name"
                    value={formData.Name}
                    onChange={(e) => setField("Name", e.target.value)}
                    error={errors.Name}
                  />
                  <DateTimePicker
                    label="Start Zeit"
                    value={formData.Start_Zeit ? dayjs(formData.Start_Zeit) : null}
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        Start_Zeit: v ? dayjs(v).format("YYYY-MM-DDTHH:mm:ssZ") : null,
                      }))
                    }
                    minutesStep={5}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        error: errors.Start_Zeit,
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Dauer"
                    value={formData.Dauer}
                    onChange={(e) => setField("Dauer", e.target.value)}
                  />

                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.Bemerkungen ?? ""} // ensure empty string when not set
                      onChange={(e) => setField("Bemerkungen", e.target.value)}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected === "" || selected == null) {
                          return <span style={{ color: "rgba(0,0,0,0.6)" }}>Bemerkungen</span>; // grey placeholder
                        }
                        return selected;
                      }}
                      MenuProps={{ PaperProps: { style: { maxHeight: 280 } } }}
                    >
                      <MenuItem value="" disabled sx={{ color: "text.secondary" }}>
                        Bemerkungen
                      </MenuItem>

                      {remarksOptions.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid2>

              {/* Right column */}
              <Grid2 size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: "grid", gap: 1.5 }}>
                  <DateTimePicker
                    label="End Zeit"
                    value={formData.End_Zeit ? dayjs(formData.End_Zeit) : null}
                    onChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        End_Zeit: v ? dayjs(v).format("YYYY-MM-DDTHH:mm:ssZ") : null,
                      }))
                    }
                    minutesStep={5}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        error: errors.End_Zeit || endRelationInvalid,
                        helperText:
                          errors.End_Zeit
                            ? formData.End_Zeit
                              ? "Ende muss nach Start sein"
                              : "Pflichtfeld"
                            : endRelationInvalid
                            ? "Ende muss nach Start sein"
                            : undefined,
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Business Area"
                    value={formData.Business_Area}
                    onChange={(e) => setField("Business_Area", e.target.value)}
                  />

                  <FormControl fullWidth size="small">
                    <Select
                      multiple
                      value={Array.isArray(formData.Business_Area1) ? formData.Business_Area1 : []}
                      onChange={(e) => {
                        const value = e.target.value;
                        // MUI may return a string when autofill is used
                        const next = typeof value === "string" ? value.split(",") : value;
                        setField("Business_Area1", next);
                      }}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected || selected.length === 0) {
                          return <span style={{ color: "rgba(0,0,0,0.6)" }}>Business Area</span>;
                        }
                        return (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {selected.map((v) => (
                              <Chip key={v} label={v} size="small" />
                            ))}
                          </Box>
                        );
                      }}
                      MenuProps={{ PaperProps: { style: { maxHeight: 280 } } }}
                    >
                      <MenuItem value="" disabled sx={{ color: "text.secondary" }}>
                        Business Area
                      </MenuItem>

                      {businessAreas.map((b) => (
                        <MenuItem key={b} value={b}>
                          <Checkbox checked={Array.isArray(formData.Business_Area1) && formData.Business_Area1.indexOf(b) > -1} />
                          <ListItemText primary={b} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid2>

              {/* Actions */}
              <Grid2 size={12}>
                <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", flexWrap: "wrap", mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      setFormData({
                        Name: "",
                        Start_Zeit: null,
                        End_Zeit: null,
                        Dauer: null,
                        Bemerkungen: "",
                        Business_Area: "",
                        Business_Area1: [],
                      })
                    }
                  >
                    Reset
                  </Button>
                  <Button size="small" variant="contained" onClick={handleCreate}>
                    Create New Zeiterfassung
                  </Button>
                </Box>
              </Grid2>
            </Grid2>
          </Paper>
        </LocalizationProvider>
      </Box>

      <Snackbar
  open={openSnackbar}
  autoHideDuration={10000} // Close after 10 seconds
  onClose={() => setOpenSnackbar(false)}
  message={snackbarMessage}
  anchorOrigin={{
    vertical: 'top', // Position from top
    horizontal: 'center', // Position from center horizontally
  }}
  sx={{
    top: '50%', // Vertically center
    transform: 'translateY(-50%)', // Adjust the position by half the Snackbar's height
  }}
/>

    </Box>
  );
}
