import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {jwtDecode as jwt_decode} from 'jwt-decode';
import { refreshAccessToken } from '../store/auth/authSlice';

function TokenRefresher() {
  const dispatch = useDispatch();
  const { refresh } = useSelector((state) => state.auth);

  useEffect(() => {
    let timeoutId;

    const scheduleRefresh = () => {
      if (!refresh) return;

      const decoded = jwt_decode(refresh);
      const expiry = decoded.exp * 1000;
      const now = Date.now();
      const bufferTime = 5000;  // 5 seconds before expiry

      const delay = expiry - now - bufferTime;

      if (delay > 0) {
        timeoutId = setTimeout(async () => {
          const resultAction = await dispatch(refreshAccessToken(refresh));
          if (refreshAccessToken.fulfilled.match(resultAction)) {
            // Token refreshed — schedule the next one
            scheduleRefresh();
          } else {
            console.error('Token refresh failed — logging out soon.');
          }
        }, delay);
      } else {
        console.warn('Refresh token already expired or about to expire.');
      }
    };

    scheduleRefresh();

    return () => clearTimeout(timeoutId);
  }, [dispatch, refresh]);

  return null;
}

export default TokenRefresher;
