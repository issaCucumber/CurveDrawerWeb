Introduction
============
- Program written in Javascript compiled by TypeScript, HTML5, CSS3

File Structure
==============
-- index.html
-- curve.ts
-- curve.js
-- styles.css
-- deg3Bspline.txt
-- deg5Bspline.txt
-- jquery.d.ts
|
-- lib/
|
-- fonts/
|
-- testfiles/
|
-- screenshots/

To run the application
=======================
- no compilation needed
- open "index.html" in any common browser with latest version (e.g. Chrome, which has been tested)

Load a curve
=============
1. File Upload
	- Click "UPLOAD FILE" to upload file
		-- File Validation:
			1. degree and order value - number format
			2. length of knots array = degree + order + 1
			3. length of contol points array = order
			4. all values in knots and control points array have to be in number format
	- If valid, the curve should be render on the canvas
2. Draw
	- Click "DRAW" to start drawing
	- Select the degree of the curve ("Cubic"/ "Degree 5")
	- Plot on the canvas to render a new B-Spline curve
	- The program can only draw one curve at a time

Functions on curve
==================
1. Toggle Uniform/ Adaptive rendering
	- Click on the toggle under "RENDERING MODES"
	- press "a" to toggle
2. Tessellation
	- Click on the spinner arrows (Up/ Down)
	- Key in the value
	- press "Shift +" to increase, "Shift -" to decrease
	- maximum value allowed = 100, minimum value allowed = 1
3. Convex Ploygon
	- Click on the toggle under "SHOW CONTROL POLYGON"
	- press "c" to toggle
4. Sampling points
	- Only available for uniform rendering
	- Click on the toggle under "SHOW SAMPLING POINTS"
	- press "p"

Extra Feature
=============
- Draw De Boor Net
	-- built to analyse the De Boor net of point(s)
	-- Input a comma- separated string in the text box (e.g. "0.01,0.02")
	-- Range defined by knot value
	-- press "Enter" to show the De Boor Net

Calculating Bezier curve height
===============================
- manipulated in adaptive rendering
- height = Distance [(the mid point of the curve - start point of the curve) - projection point of the mid point on the baseline]
