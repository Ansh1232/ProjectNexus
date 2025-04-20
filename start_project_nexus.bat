@echo off
echo Starting Project Nexus (Frontend and Backend)...

echo Opening MongoDB Compass...
start "" "C:\Program Files\MongoDB Compass\MongoDBCompass.exe"
timeout /t 5

echo Checking MongoDB connection...
echo Please make sure MongoDB is connected to mongodb://127.0.0.1:27017/abc
echo If you see any errors in backend startup, please connect MongoDB manually.

echo Starting Backend Server...
start cmd /k "cd nixxx && npm run dev"
timeout /t 5

echo Starting Frontend...
start cmd /k "cd nexus-front && npm start"

echo Project Nexus is starting. Please wait for the servers to initialize.
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend will be available at: http://localhost:5000
echo.
echo Press any key to exit this window (servers will continue running)
pause > nul 