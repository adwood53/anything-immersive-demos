@echo off

:: The lib directory
set "LIB_ROOT=%CD%"

:: Ensure this is adjusted to your local emsdk path
set "EMSCRIPTEN_DIR=C:\Dev\emsdk\upstream\emscripten"
set "EMSCRIPTEN_CMAKE_DIR=%EMSCRIPTEN_DIR%\cmake\Modules\Platform\Emscripten.cmake"

:: Sets the compile flags. [SIMD, THREADS, DEFAULT]
set "BUILD_TYPE=DEFAULT"

if "%BUILD_TYPE%"=="SIMD" (
    echo Compiling with SIMD enabled
    set "INSTALL_DIR=%LIB_ROOT%\build_simd"
    set "BUILD_FLAGS=-O3 -std=c++17"
    set "CONF_OPENCV=--simd"
) else if "%BUILD_TYPE%"=="THREADS" (
    echo Compiling with THREADS enabled
    set "INSTALL_DIR=%LIB_ROOT%\build_threads"
    set "BUILD_FLAGS=-O3 -std=c++17 -s USE_PTHREADS=1 -s PTHREAD_POOL_SIZE=4"
    set "CONF_OPENCV=--threads"
) else (
    echo Compiling with DEFAULT settings
    set "INSTALL_DIR=%LIB_ROOT%\build"
    set "BUILD_FLAGS=-O3 -std=c++17"
    set "CONF_OPENCV="
)

set "libs=EIGEN OPENCV OBINDEX2 IBOW_LCD SOPHUS CERES OPENGV"
goto :main

:print_step
echo Building: %1
exit /b

:build_OPENCV
call :print_step OPENCV
if exist "%INSTALL_DIR%\opencv\" rd /s /q "%INSTALL_DIR%\opencv"
if exist "%LIB_ROOT%\opencv\build" rd /s /q "%LIB_ROOT%\opencv\build"
python "%LIB_ROOT%\opencv\platforms\js\build_js.py" "%LIB_ROOT%\opencv\build" --build_wasm %CONF_OPENCV% --emscripten_dir "%EMSCRIPTEN_DIR%"
xcopy /E /I /Y "%LIB_ROOT%\opencv\build" "%INSTALL_DIR%\opencv\"
exit /b

:build_EIGEN
call :print_step EIGEN
if exist "%INSTALL_DIR%\eigen\" rd /s /q "%INSTALL_DIR%\eigen"
if exist "%LIB_ROOT%\eigen\build" rd /s /q "%LIB_ROOT%\eigen\build"
mkdir "%LIB_ROOT%\eigen\build"
cd "%LIB_ROOT%\eigen\build"
call emcmake cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_STANDARD=17 -DCMAKE_TOOLCHAIN_FILE="%EMSCRIPTEN_CMAKE_DIR%" -DCMAKE_CXX_FLAGS="%BUILD_FLAGS%" -DCMAKE_C_FLAGS="%BUILD_FLAGS%" -DCMAKE_INSTALL_PREFIX="%INSTALL_DIR%\eigen" -DBUILD_SHARED_LIBS=OFF
call emmake ninja -j %NUMBER_OF_PROCESSORS% install
cd "%LIB_ROOT%"
exit /b

:build_OBINDEX2
call :print_step OBINDEX2
if exist "%INSTALL_DIR%\obindex2\" rd /s /q "%INSTALL_DIR%\obindex2"
if exist "%LIB_ROOT%\obindex2\build" rd /s /q "%LIB_ROOT%\obindex2\build"
mkdir "%LIB_ROOT%\obindex2\build"
cd "%LIB_ROOT%\obindex2\build"
call emcmake cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_STANDARD=17 -DCMAKE_TOOLCHAIN_FILE="%EMSCRIPTEN_CMAKE_DIR%" -DCMAKE_CXX_FLAGS="%BUILD_FLAGS% -s USE_BOOST_HEADERS=1" -DCMAKE_C_FLAGS="%BUILD_FLAGS% -s USE_BOOST_HEADERS=1" -DCMAKE_INSTALL_PREFIX="%INSTALL_DIR%\obindex2" -DBUILD_SHARED_LIBS=OFF -DOpenCV_DIR="%LIB_ROOT%\opencv\build" -DCMAKE_CXX_STANDARD_REQUIRED=ON
call emmake ninja -j %NUMBER_OF_PROCESSORS% install
cd "%LIB_ROOT%"
exit /b

:build_IBOW_LCD
call :print_step IBOW_LCD
if exist "%INSTALL_DIR%\ibow_lcd\" rd /s /q "%INSTALL_DIR%\ibow_lcd"
if exist "%LIB_ROOT%\ibow_lcd\build" rd /s /q "%LIB_ROOT%\ibow_lcd\build"
mkdir "%LIB_ROOT%\ibow_lcd\build"
cd "%LIB_ROOT%\ibow_lcd\build"
call emcmake cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_STANDARD=17 -DCMAKE_TOOLCHAIN_FILE="%EMSCRIPTEN_CMAKE_DIR%" -DCMAKE_CXX_FLAGS="%BUILD_FLAGS% -s USE_BOOST_HEADERS=1" -DCMAKE_C_FLAGS="%BUILD_FLAGS% -s USE_BOOST_HEADERS=1" -DCMAKE_INSTALL_PREFIX="%INSTALL_DIR%\ibow_lcd" -DBUILD_SHARED_LIBS=OFF -DOpenCV_DIR="%LIB_ROOT%\opencv\build" -DCMAKE_CXX_STANDARD_REQUIRED=ON
call emmake ninja -j %NUMBER_OF_PROCESSORS% install
cd "%LIB_ROOT%"
exit /b

:build_SOPHUS
call :print_step SOPHUS
if exist "%INSTALL_DIR%\Sophus\" rd /s /q "%INSTALL_DIR%\Sophus"
if exist "%LIB_ROOT%\Sophus\build" rd /s /q "%LIB_ROOT%\Sophus\build"
mkdir "%LIB_ROOT%\Sophus\build"
cd "%LIB_ROOT%\Sophus\build"
call emcmake cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_STANDARD=17 -DCMAKE_TOOLCHAIN_FILE="%EMSCRIPTEN_CMAKE_DIR%" -DCMAKE_CXX_FLAGS="%BUILD_FLAGS%" -DCMAKE_C_FLAGS="%BUILD_FLAGS%" -DCMAKE_INSTALL_PREFIX="%INSTALL_DIR%\Sophus" -DBUILD_SHARED_LIBS=OFF -DEIGEN3_INCLUDE_DIR="%LIB_ROOT%\eigen"
call emmake ninja -j %NUMBER_OF_PROCESSORS% install
cd "%LIB_ROOT%"
exit /b

:build_CERES
call :print_step CERES
if exist "%INSTALL_DIR%\ceres-solver\" rd /s /q "%INSTALL_DIR%\ceres-solver"
if exist "%LIB_ROOT%\ceres-solver\build" rd /s /q "%LIB_ROOT%\ceres-solver\build"
mkdir "%LIB_ROOT%\ceres-solver\build"
cd "%LIB_ROOT%\ceres-solver\build"
call emcmake cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_STANDARD=17 -DCMAKE_TOOLCHAIN_FILE="%EMSCRIPTEN_CMAKE_DIR%" -DCMAKE_CXX_FLAGS="%BUILD_FLAGS%" -DCMAKE_C_FLAGS="%BUILD_FLAGS%" -DCMAKE_INSTALL_PREFIX="%INSTALL_DIR%\ceres-solver" -DBUILD_SHARED_LIBS=OFF -DBUILD_EXAMPLES:BOOL=0 -DBUILD_TESTING:BOOL=0 -DEIGENSPARSE:BOOL=1 -DCERES_THREADING_MODEL="NO_THREADS" -DMINIGLOG:BOOL=1 -DEigen3_DIR="%LIB_ROOT%\eigen\build"
call emmake ninja -j %NUMBER_OF_PROCESSORS% install
powershell -Command "Get-ChildItem -Path '%INSTALL_DIR%\ceres-solver\include' -Filter *.h -Recurse | ForEach-Object { (Get-Content $_.FullName) -replace 'glog/logging.h', 'ceres/internal/miniglog/glog/logging.h' | Set-Content $_.FullName }"
cd "%LIB_ROOT%"
exit /b

:build_OPENGV
call :print_step OPENGV
if exist "%INSTALL_DIR%\opengv\" rd /s /q "%INSTALL_DIR%\opengv"
if exist "%LIB_ROOT%\opengv\build" rd /s /q "%LIB_ROOT%\opengv\build"
mkdir "%LIB_ROOT%\opengv\build"
cd "%LIB_ROOT%\opengv\build"
call emcmake cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_STANDARD=17 -DCMAKE_TOOLCHAIN_FILE="%EMSCRIPTEN_CMAKE_DIR%" -DCMAKE_CXX_FLAGS="%BUILD_FLAGS%" -DCMAKE_C_FLAGS="%BUILD_FLAGS%" -DCMAKE_INSTALL_PREFIX="%INSTALL_DIR%\opengv" -DBUILD_SHARED_LIBS=OFF -DEIGEN_INCLUDE_DIR="%LIB_ROOT%\eigen" -DCMAKE_CXX_STANDARD_REQUIRED=ON
call emmake ninja -j %NUMBER_OF_PROCESSORS% install
cd "%LIB_ROOT%"
exit /b

:main
for %%i in (%libs%) do (
    call :build_%%i
    if errorlevel 1 (
        echo Error building %%i
        exit /b 1
    )
    echo.
    echo.
)
echo All done!
endlocal
exit /b