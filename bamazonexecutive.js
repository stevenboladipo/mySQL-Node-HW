var mysql = require("mysql");
var prompt = require("prompt");
var fs = require("fs");
var open = require("open");

var data;
var connection = mysql.createConnection({
	host: "localhost",
	user: "public",
	password: "Rasheed08",
	database: "bamazon"
});

function connect(){
	connection.connect(function(err){
		if(err) endConnect();
		listOptions();
	});
};
function endConnect(){
	console.log("\nGoodbye!")
	connection.end(function(err){
		if(err) throw err;
	});
};
function listOptions(){
	console.log("\n 1) View Product Sales by Department\n 2) Create New Department\n 3) End Session\n");
	prompt.get(["Number"], function(err, result){
		if(err){
			endConnect();
			return;
		};
		var num = result["Number"];
		if(num != "1" && num != "2" && num!= "3"){
			console.log("\nPlease choose a valid option.");
			listOptions();
			return;
		};
		if(num == 1) getData(viewSales);
		if(num == 2) getData(createDepartment);
		if(num == 3) endConnect();
	});
};
function viewSales(){
	var html = "<DOCTYPE! html><html><head><title>Department Sales</title><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css' integrity='sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7' crossorigin='anonymous'></head><body><div style='margin: 50px'><table class='table table-striped table-bordered'><tr><th>#</th><th>Department</th><th>Overhead Costs</th><th>Total Sales</th><th>Profits</th></tr>";
	for(var i=0; i<data.length; i++){
		var profits = parseFloat(data[i].TotalSales) - parseFloat(data[i].OverHeadCosts);
		var color;
		if(profits < 0){
			color = "danger";
		} else {
			color = "success";
		};
		html += "<tr class='"+color+"'><td class='info'>" + data[i].DepartmentID + "</td><td>" + data[i].DepartmentName + "</td><td>" + parseFloat(data[i].OverHeadCosts).toFixed(2) + "</td><td>" + parseFloat(data[i].TotalSales).toFixed(2) + "</td><td>" + profits.toFixed(2) + "</td></tr>";
	};
	html += "</div></table></body></html>";
	fs.writeFile("profits.html", html, "utf-8", function(err){
		if(err){
			console.log(err);
		} else {
			open("./profits.html");
		}
		listOptions()
	})
};
function createDepartment(){
	prompt.get(["DepartmentName", "OverHeadCosts", "TotalSales"], function(err, result){
		if(err) {
			endConnect();
			return;
		};
		var id = data.length + 1;
		var name = result.DepartmentName;
		var costs = parseFloat(result.OverHeadCosts).toFixed(2);
		var sales = parseFloat(result.TotalSales).toFixed(2);
		var newDepartment = {
			DepartmentID: id,
			DepartmentName: name,
			OverHeadCosts: costs,
			TotalSales: sales
		};
		data.push(newDepartment);
		connection.query("INSERT INTO Departments SET ?", newDepartment, function(err, result){
			if(err) throw err;
			console.log("\nDepartment added successfully.\n");
			listOptions();
		})
	});
};
function getData(callback){
	connection.query("SELECT * FROM Departments", function(err, rows){
		if(err) endConnect();
		data = rows;
		if(callback != undefined) callback();
	});
};
connect();