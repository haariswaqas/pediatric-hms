import ScheduledTasksList from '../schedules/ScheduledTasksList';
import ScheduleTask from '../schedules/ScheduleTask';
import {Route, Routes} from 'react-router-dom';

export default function SchedulerApp() {
    return (
        <Routes>
            <Route path="/" element={<ScheduledTasksList />} />
            <Route path="create" element={<ScheduleTask />} />
        </Routes>
    );
}