import './App.css';
import {useEffect, useState} from "react";
import async from "async";

function App() {
    const [csvData, setCsvData] = useState([]);
    const [salaryData, setSalaryData] = useState([]);
    const [csvDataToUpload, setCsvDataToUpload] = useState(null);
    const [editRowIndex, setEditRowIndex] = useState(null);

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const rows = text.split('\n');
                const headers = rows[0].split(',');

                headers.map((header, index) => {
                    headers[index] = header.replace(" ", "_");
                });

                const data = [];
                for (let i = 1; i < rows.length; i++) {
                    const values = rows[i].split(',');
                    if (values.length === headers.length) {
                        const rowObject = {};
                        for (let j = 0; j < headers.length; j++) {
                            rowObject[headers[j]] = values[j];
                        }
                        data.push(rowObject);
                    }
                }
                const finalCsvData = {
                    'columns': headers, 'data': data
                };
                setCsvDataToUpload(finalCsvData);
            };
            reader.readAsText(uploadedFile);
        }
    };

    const getDataFromAPI = async () => {
        const employeeData = await fetch('http://localhost:8000/list', {
            method: 'POST', headers: {
                "Content-Type": "application/json", "Accept": "application/json"
            }
        });
        const employeeDataResponse = await employeeData.json();
        setCsvData(employeeDataResponse);
    };

    const getSalaryDataFromAPI = async () => {
        const apiSalaryData = await fetch('http://localhost:8000/salary', {
            method: 'POST', headers: {
                "Content-Type": "application/json", "Accept": "application/json"
            }
        });
        const salaryDataResponse = await apiSalaryData.json();
        setSalaryData(salaryDataResponse.message);
    };

    const uploadToAPI = async () => {
        if (csvDataToUpload) {
            await fetch('http://localhost:8000/import', {
                method: 'POST', body: JSON.stringify(csvDataToUpload), headers: {
                    "Content-Type": "application/json", "Accept": "application/json"
                },
            })
                .then((response) => {
                    getDataFromAPI();
                })
                .catch((error) => {
                    // Handle errors
                    console.error('API error:', error);
                });
        }
    };

    useEffect(() => {
        getDataFromAPI();
        getSalaryDataFromAPI();
    }, []);

    const handleEditClick = (rowIndex) => {
        setEditRowIndex(rowIndex);
    };

    const handleSaveClick = (rowIndex) => {
        // Send an API request to update the email address
        const updatedEmail = csvData[rowIndex].Email_Address;
        const employeeId = csvData[rowIndex].Id;
        // Make an API call to update the email for the employee
        // Replace 'your-api-endpoint' with your actual API endpoint
        fetch('http://localhost:8000/employee/update/' + employeeId, {
            method: 'POST', headers: {
                "Content-Type": "application/json", "Accept": "application/json"
            }, body: JSON.stringify({email: updatedEmail, id: employeeId}),
        })
            .then((response) => {
                // Handle API response as needed
                console.log('API response:', response);
                setEditRowIndex(null); // Clear the edit mode
            })
            .catch((error) => {
                // Handle errors
                console.error('API error:', error);
            });
    };

    return (<div className="csv-uploader">
        <h2>CSV File Upload and Display</h2>
        <input type="file" accept=".csv" onChange={handleFileUpload}/>
        {csvDataToUpload && (<button onClick={uploadToAPI} className="upload-button">
            Upload to API
        </button>)}
        <table className="csv-table">
            <thead>
            <tr>
                {csvData[0] && Object.keys(csvData[0]).map((header, index) => (<th key={index}>{header}</th>))}
                <th>Action</th>
            </tr>
            </thead>
            <tbody>
            {csvData.map((row, rowIndex) => (<tr key={rowIndex}>
                {Object.keys(row).map((cell, cellIndex) => (<td key={cellIndex}>
                    {cell === 'Email_Address' && editRowIndex === rowIndex ? (<input
                        type="text"
                        value={row[cell]}
                        onChange={(e) => {
                            const updatedData = [...csvData];
                            updatedData[rowIndex].Email_Address = e.target.value;
                            setCsvData(updatedData);
                        }}
                    />) : (row[cell])}
                </td>))}
                <td>
                    {(editRowIndex === rowIndex ? (
                        <button onClick={() => handleSaveClick(rowIndex)}>Save</button>) : (
                        <button onClick={() => handleEditClick(rowIndex)}>Edit</button>))}
                </td>
            </tr>))}
            </tbody>
        </table>
        <h2>Average Salary Data</h2>
        <table className="csv-table">
            <thead>
            <tr>
                {salaryData[0] && Object.keys(salaryData[0]).map((header, index) => (
                    <th key={index}>{header}</th>))}
            </tr>
            </thead>
            <tbody>
            {salaryData.map((row, rowIndex) => (<tr key={rowIndex}>
                {Object.keys(row).map((cell, cellIndex) => (<td key={cellIndex}>
                    {row[cell]}
                </td>))}
            </tr>))}
            </tbody>
        </table>
    </div>);
}

export default App;
