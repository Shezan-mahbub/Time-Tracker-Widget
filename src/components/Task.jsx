import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

const ZOHO = window.ZOHO;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#004d40",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "#fff", // explicitly set white
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function Task() {
  const [initialized, setInitialized] = React.useState(false);
  const [entity, setEntity] = React.useState(null);
  const [entityID, setEntityID] = React.useState(null);
  const [timeRecordsData, setTimeRecordsData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [mikeTaskRecord, setMikeTaskRecord] = React.useState({});
  const [openDialog, setOpenDialog] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [range, setRange] = React.useState({
    startMonth: new Date().getMonth(),
    startYear: new Date().getFullYear(),
    endMonth: new Date().getMonth(),
    endYear: new Date().getFullYear(),
  });

  const tableRef = useRef(null);
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  React.useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", function (data) {
      setInitialized(true);
      setEntity(data?.Entity);
      setEntityID(data?.EntityId);
      ZOHO.CRM.UI.Resize({ height: "90%", width: "90%" });
    });

    ZOHO.embeddedApp.init();
  }, []);
  //   console.log("object", entity);

  React.useEffect(() => {
    if (initialized) {
      const fetchData = async () => {
        try {
          const timeRecords = await ZOHO.CRM.API.getRelatedRecords({
            Entity: "TasksMike",
            RecordID: entityID,
            RelatedList: "Zeiterfassungen",
            page: 1,
            per_page: 200,
          });

          setTimeRecordsData(timeRecords?.data || []);
        } catch (error) {
          console.error("Error fetching deal data:", error);
          setTimeRecordsData([]); // fallback
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [initialized, entity, entityID]);

  console.log("object111", timeRecordsData);

  React.useEffect(() => {
    if (!initialized || !entityID) return;

    const fetchTaskRecord = async () => {
      try {
        const taskResponse = await ZOHO.CRM.API.getRecord({
          Entity: "TasksMike",
          RecordID: entityID,
        });

        setMikeTaskRecord(taskResponse?.data?.[0] || []);
      } catch (error) {
        console.error("Error fetching TasksMike record:", error);
        setMikeTaskRecord([]); // fallback
      }
    };

    fetchTaskRecord();
  }, [initialized, entityID]);
  console.log("object", mikeTaskRecord);
  const selectedEndMonthName = new Date(0, range.endMonth).toLocaleString(
    "default",
    {
      month: "long",
    }
  );

  const handleDownloadPDF = async () => {
    const input = tableRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      scrollY: -window.scrollY, // ensures correct Y offset
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // If image is taller than one page, scale to fit
    const heightToUse = imgHeight > pdfHeight ? pdfHeight : imgHeight;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, heightToUse);
    pdf.save(`Time_Records_${selectedEndMonthName}.pdf`);
  };

  const generatePDF = async () => {
    const input = tableRef.current;
    if (!input) return null;

    const canvas = await html2canvas(input, {
      scale: 2,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    const heightToUse = imgHeight > pdfHeight ? pdfHeight : imgHeight;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, heightToUse);

    return pdf.output("blob");
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleAttachPDF = async () => {
    setUploading(true); // Start loader

    const blob = await generatePDF();
    if (!blob || !entity || !entityID) {
      setUploading(false);
      return;
    }

    const file = {
      Name: `Time_Records_${selectedEndMonthName}.pdf`,
      Content: blob,
    };

    try {
      const response = await ZOHO.CRM.API.attachFile({
        Entity: entity,
        RecordID: entityID,
        File: file,
      });

      console.log("File attached:", response);

      const successCode = response?.data?.[0]?.code;
      console.log("object666", successCode);

      if (successCode === "SUCCESS") {
        // ✅ Delay before executing the function
        await delay(4000); // Wait for 4 seconds
        console.log("object555", entityID);
        const func_name = "send_mail_with_attachment";
        const req_data = {
          arguments: JSON.stringify({
            task_id: entityID?.[0],
          }),
        };

        ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
          .then((funcResponse) => {
            console.log("Function executed:", funcResponse);

            if (funcResponse?.code === "success") {
              ZOHO.CRM.UI.Popup.closeReload().then((data) => {
                console.log("Popup closed and reloaded:", data);
              });
            } else {
              alert("Attachment uploaded, but email function failed.");
              handleOpenDialog();
            }
          })
          .catch((error) => {
            console.error("Function execution error:", error);
            alert("Attachment uploaded, but email function failed.");
            handleOpenDialog();
          });
      } else {
        alert("Attachment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error attaching PDF:", error);
      alert("Failed to attach the PDF.");
    } finally {
      setUploading(false); // Stop loader
    }
  };

  const filteredTimeRecords = timeRecordsData.filter((record) => {
    const start = new Date(record?.Start_Zeit);
    const startDate = new Date(range.startYear, range.startMonth, 1);
    const endDate = new Date(range.endYear, range.endMonth + 1, 0); // end of selected month

    return start >= startDate && start <= endDate;
  });

  return (
    <Box sx={{ pl: 5, pr: 5, pt: 4 }}>
      {loading ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          <CircularProgress />
        </Typography>
      ) : Array.isArray(timeRecordsData) && timeRecordsData.length > 0 ? (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box>
{/*               <Typography align="left">
                <span style={{ fontWeight: 600 }}>Company Name: </span>
                {mikeTaskRecord?.Company_Name}
              </Typography> */}
              {/* <Typography align="left">
      <span style={{ fontWeight: 600 }}>Task Name: </span>{mikeTaskRecord?.Name}
    </Typography> */}
              <Box
                sx={{ display: "flex", gap: 4, alignItems: "center", mb: 2 }}
              >
                {/* Start Date */}
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography fontWeight={600}>From:</Typography>
                  <select
                    value={range.startMonth}
                    onChange={(e) =>
                      setRange({
                        ...range,
                        startMonth: parseInt(e.target.value),
                      })
                    }
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {new Date(0, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>

                  <select
                    value={range.startYear}
                    onChange={(e) =>
                      setRange({
                        ...range,
                        startYear: parseInt(e.target.value),
                      })
                    }
                  >
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </Box>

                {/* End Date */}
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography fontWeight={600}>To:</Typography>
                  <select
                    value={range.endMonth}
                    onChange={(e) =>
                      setRange({ ...range, endMonth: parseInt(e.target.value) })
                    }
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {new Date(0, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>

                  <select
                    value={range.endYear}
                    onChange={(e) =>
                      setRange({ ...range, endYear: parseInt(e.target.value) })
                    }
                  >
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </Box>
              </Box>
            </Box>

            <Button variant="outlined" size="small" onClick={handleDownloadPDF}>
              Download PDF
            </Button>
          </Box>

          <Typography
            variant="h6"
            align="center"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Time Recordings
          </Typography>
          <TableContainer component={Paper} ref={tableRef}>
            <Table sx={{ minWidth: 300 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Zeiterfassung Name</StyledTableCell>
                  <StyledTableCell align="right">Task Owner</StyledTableCell>
                  <StyledTableCell align="right">Task Priority</StyledTableCell>
                  <StyledTableCell align="right">Task Status</StyledTableCell>
                  <StyledTableCell align="right">Business Area</StyledTableCell>
                  <StyledTableCell align="right">Start Date</StyledTableCell>
                  <StyledTableCell align="right">Start Time</StyledTableCell>
                  <StyledTableCell align="right">End Date</StyledTableCell>
                  <StyledTableCell align="right">End Time</StyledTableCell>
                  <StyledTableCell align="right">
                    Countable Time
                  </StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredTimeRecords.map((row) => (
                  <StyledTableRow key={row.name}>
                    <StyledTableCell component="th" scope="row" size="small">
                      {row?.Name}
                    </StyledTableCell>
                    <StyledTableCell align="right" size="small">
                      {mikeTaskRecord?.Owner?.name}
                    </StyledTableCell>
                    <StyledTableCell align="right" size="small">
                      {mikeTaskRecord?.Task_Priority}
                    </StyledTableCell>
                    <StyledTableCell align="right" size="small">
                      {mikeTaskRecord?.Status}
                    </StyledTableCell>
                    <StyledTableCell align="right" size="small">
                      {row?.Business_Area}
                    </StyledTableCell>
                    <StyledTableCell align="right" size="small">
                      {new Date(row?.Start_Zeit).toLocaleDateString("en-GB")}
                    </StyledTableCell>
                    <StyledTableCell align="right" size="small">
                      {new Date(row?.Start_Zeit).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </StyledTableCell>
                    <StyledTableCell align="right" size="small">
                      {new Date(row?.End_Zeit).toLocaleDateString("en-GB")}
                    </StyledTableCell>
                    <StyledTableCell align="right" size="small">
                      {new Date(row?.End_Zeit).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </StyledTableCell>
                    <StyledTableCell align="right" size="small">
                      {(() => {
                        const start = new Date(row.Start_Zeit);
                        const end = new Date(row.End_Zeit);
                        const diffMs = end - start;
                        const hours = Math.floor(diffMs / (1000 * 60 * 60));
                        const minutes = Math.floor(
                          (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                        );
                        return `${hours}h ${minutes}m`;
                      })()}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}

                <StyledTableRow>
                  <StyledTableCell colSpan={9} />
                  <StyledTableCell align="right" sx={{ fontWeight: "bold" }}>
                    {(() => {
                      const totalMs = filteredTimeRecords.reduce((acc, row) => {
                        const start = new Date(row.Start_Zeit);
                        const end = new Date(row.End_Zeit);
                        return acc + (end - start);
                      }, 0);

                      const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
                      const totalMinutes = Math.floor(
                        (totalMs % (1000 * 60 * 60)) / (1000 * 60)
                      );
                      return `Total Time: ${totalHours}h ${totalMinutes}m`;
                    })()}
                  </StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 8 }} align="center">
            <Button
              onClick={handleAttachPDF}
              variant="contained"
              size="small"
              disabled={uploading}
              startIcon={uploading && <CircularProgress size={16} />}
            >
              {uploading ? "Sending..." : "Send Email"}
            </Button>
          </Box>
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="email-success-dialog-title"
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle id="email-success-dialog-title" align="center">
              Email Sent
            </DialogTitle>
            <DialogContent>
              <Typography align="center" sx={{ py: 4 }}>
                Email has been sent successfully.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
              <Button
                onClick={handleCloseDialog}
                variant="contained"
                size="small"
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          There is no Time Records to show.
        </Typography>
      )}
    </Box>
  );
}
