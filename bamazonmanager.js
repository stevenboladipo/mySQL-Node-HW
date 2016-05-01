var mysql = require("mysql");
var prompt = require("prompt");
var fs = require("fs");
var open = require("open");

var connection = mysql.createConnection({
	host: "localhost",
	user: "public",
	password: "Coolbeans777",
	database: "Bamazon"
});
var products;
function connect(){
	connection.connect(function(err){
		if(err) {
			endConnect();
			return;
		};
	});
};
function endConnect(){
	console.log("\nGoodbye!")
	connection.end(function(err){
		if(err) {
			console.log(err);
		};
	});
};
function listOptions(){
	console.log("\nWhat would you like to do?\n");
	console.log("1) View Products for Sale");
	console.log("2) View Low Inventory");
	console.log("3) Add to Inventory");
	console.log("4) Add New Product");
	console.log("5) End Session\n");
	prompt.get(["Number"], function(err, result){
		if(err) {
			endConnect();
			return
		};
		var num = parseInt(result["Number"]);
		switch (num) {
			case 1:
				getTable(viewProducts);
				break;
			case 2:
				getTable(viewLowProducts);
				break;
			case 3:
				getTable(addInventory);
				break;
			case 4:
				console.log("\nPlease give the imformation about this product.")
				getTable(addProduct);
				break;
			case 5:
				endConnect();
				break;
			default:
				console.log("\nPlease enter a valid option.");
				listOptions();
		};
	});
};
function getTable(callback){
	connection.query("SELECT * FROM Products", function(err, rows){
		if(err) endConnect();
		products = rows;
		if(callback != undefined) callback();
	});
};
function viewProducts(){
	for(var i=0; i<products.length; i++){
		console.log(products[i].ItemID+". "+products[i].ProductName + ": $"+products[i].Price+" ("+products[i].Quantity+" available)");
	};
	var html = "<DOCTYPE! html><html><head><title>Product List</title><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css' integrity='sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7' crossorigin='anonymous'></head><body><div style='margin: 50px'><table class='table table-striped table-bordered'><tr><th>#</th><th>Product</th><th>Department</th><th>Price</th><th>Quantity</th></tr>";
	for(var i=0; i<products.length; i++){
		var color;
		if(parseInt(products[i].Quantity) < 5){
			color = "danger";
		} else {
			color = "success";
		};
		html += "<tr class='"+color+"'><td class='info'>" + products[i].ItemID + "</td><td>" + products[i].ProductName + "</td><td>" + products[i].DepartmentName + "</td><td>" + parseFloat(products[i].Price).toFixed(2) + "</td><td>" + products[i].Quantity + "</td></tr>";
	};
	html += "</div></table></body></html>";
	fs.writeFile("products.html", html, "utf-8", function(err){
		if(err){
			endConnect();
		} else {
			open("./products.html");
		}
	})
	askAgain();
};
function viewLowProducts(){
	var count = 0;
	console.log("");
	for(var i=0; i<products.length; i++){
		if(parseInt(products[i].Quantity) < 5){
			count++;
			console.log(products[i].ItemID+") "+products[i].ProductName + ": $"+products[i].Price+" ("+products[i].Quantity+" available)");
		};
	};
	if(count == 0){
		console.log("\nNo items low in inventory");
	} else {
		var html = "<DOCTYPE! html><html><head><title>Product List</title><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css' integrity='sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7' crossorigin='anonymous'></head><body><div style='margin: 50px'><table class='table table-striped table-bordered'><tr><th>#</th><th>Product</th><th>Department</th><th>Price</th><th>Quantity</th></tr>";
		for(var i=0; i<products.length; i++){
			if(parseInt(products[i].Quantity) < 5){
				html += "<tr class='danger'><td class='info'>" + products[i].ItemID + "</td><td>" + products[i].ProductName + "</td><td>" + products[i].DepartmentName + "</td><td>" + parseFloat(products[i].Price).toFixed(2) + "</td><td>" + products[i].Quantity + "</td></tr>";
			};
		};
		html += "</div></table></body></html>";
		fs.writeFile("low.html", html, "utf-8", function(err){
			if(err){
				endConnect();
			} else {
				open("./low.html");
			}
		})
	}
	askAgain();
};
function addInventory(){
	prompt.get(["ItemID", "Quantity"], function(err, result){
		if(err) {
			endConnect();
			return;
		};
		if(result.ItemID == "view"){
			viewProducts();
			return;
		};
		var id = parseInt(result.ItemID);
		if(id == NaN || id > products.length || id < 1){
			console.log("\nPlease enter a valid ID or enter 'view' to view the products in stock.");
			addInventory();
			return;
		};
		var newAmount = parseInt(products[id-1].Quantity) + parseInt(result.Quantity);
		changeQuantity(id, newAmount)
	});
};
function addProduct(){
	prompt.get(["Name", "Price", "Department", "Quantity"], function(err, result){
		if(err) {
			endConnect();
			return;
		};
		var id = products.length + 1;
		var name = result.Name;
		var price = parseFloat(result.Price);
		var type = result.Department;
		var quantity = parseInt(result.Quantity);
		if(quantity == NaN || quantity < 1){
			console.log("\nPlease enter valid quantity");
			addProduct();
			return;
		};
		if(price == NaN || price < 0.01){
			console.log("\nPlease enter a valid price");
			addProduct();
			return;
		};
		var newProduct = {
			ProductName: name,
			ItemID: id,
			Price: price,
			DepartmentName: type,
			Quantity: quantity
		};
		products.push(newProduct);
		connection.query("INSERT INTO Products SET ?", newProduct, function(err, result){
			if(err) throw err;
			console.log("\nProduct added to inventory successfully.");
			askAgain();
		})
	});
};
function askAgain(){
	console.log("\nWould you like to preform more tasks?")
	prompt.get(["Y/N"], function(err, result){
		if(err){
			endConnect();
		} else if(result["Y/N"] == "Y" || result["Y/N"] == "y") {
			listOptions();
		} else {
			endConnect();
		};
	});
};
function changeQuantity(id, quantity){
	getTable();
	products[parseInt(id) - 1].Quantity = products[parseInt(id) - 1].Quantity + parseInt(quantity);
	connection.query(
		"UPDATE Products SET Quantity = ? WHERE ItemID = ?",
		[products[parseInt(id)-1].Quantity, id],
		function(err, result) {
			if(err) endConnect();
		}
	);
	console.log("\nAdded items to inventory successfully!");
	askAgain();
};
connect();
getTable(listOptions);