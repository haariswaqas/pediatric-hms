import ReportList from '../report/ReportList';
import {Route, Routes} from 'react-router-dom';

export default function ReportApp() {
    return (
        <Routes>
            <Route path="/" element={<ReportList />} />
        </Routes>
    );
}