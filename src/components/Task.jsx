import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box ,Button,Typography} from "@mui/material";

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


  React.useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", function (data) {
      setInitialized(true);
      setEntity(data?.Entity);
      setEntityID(data?.EntityId);
      ZOHO.CRM.UI.Resize({ height: "90%", width: "60%" });
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
  console.log("object", timeRecordsData);
return (
  <Box sx={{ pl: 5, pr: 5, pt: 4 }}>
    <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 600 }}>
      Time Recordings
    </Typography>

    {loading ? (
      <Typography variant="body1" align="center" sx={{ mt: 4 }}>
        Loading time records...
      </Typography>
    ) : Array.isArray(timeRecordsData) && timeRecordsData.length > 0 ? (
      <>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 300 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Task</StyledTableCell>
                <StyledTableCell align="right">Company Name</StyledTableCell>
                <StyledTableCell align="right">Business Area</StyledTableCell>
                <StyledTableCell align="right">Start Time</StyledTableCell>
                <StyledTableCell align="right">End Time</StyledTableCell>
                <StyledTableCell align="right">Countable Time</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timeRecordsData.map((row) => (
                <StyledTableRow key={row.name}>
                  <StyledTableCell component="th" scope="row" size="small">
                    {row.Name}
                  </StyledTableCell>
                  <StyledTableCell align="right" size="small">
                    {row.Name}
                  </StyledTableCell>
                  <StyledTableCell align="right" size="small">
                    {row.$status}
                  </StyledTableCell>
                  <StyledTableCell align="right" size="small">
                    {new Date(row.Start_Zeit).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </StyledTableCell>
                  <StyledTableCell align="right" size="small">
                    {new Date(row.End_Zeit).toLocaleTimeString([], {
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
                <StyledTableCell colSpan={5} />
                <StyledTableCell align="right" sx={{ fontWeight: "bold" }}>
                  {(() => {
                    const totalMs = timeRecordsData.reduce((acc, row) => {
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

        <Box sx={{ mt: 2 }} align="right">
          <Button sx={{ backgroundColor: "red" }} variant="contained" size="small">
            Send Email
          </Button>
        </Box>
      </>
    ) : (
      <Typography variant="body1" align="center" sx={{ mt: 4 }}>
        There is no Time Records to show for this Task.
      </Typography>
    )}
  </Box>
);
}
