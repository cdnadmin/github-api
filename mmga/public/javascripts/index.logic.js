

/***************************************************************************/
var GhUserModel = Backbone.Model.extend({
	defaults: {
		login:"login_id_here",
		url:"login_url_here"
	}
});

/***************************************************************************/
var GhUsersCollection = Backbone.Collection.extend({
	model:GhUserModel
});
/***************************************************************************/
var GhRepoModel = Backbone.Model.extend({
	defaults : {
		full_name : "full_name_here",
		html_url : "html_url_here"	
	}
});
/***************************************************************************/
var GhReposCollection = Backbone.Collection.extend({
	model:GhRepoModel
});

/***************************************************************************/
var MainView = Backbone.View.extend({
	el : "#mainArticle",

	events : {
		//"keypress input#inputUserName": "clicked",
		"click input#submitButton": "clicked",
		//"touchstart input#submitButton" : "clicked"
	},

	clicked : function(evt){
		if (evt.keyCode === 13 || evt.currentTarget.id === 'submitButton'){

			if ($('#inputUserName').val().trim().length <= 0){
					var reposListView = new RepoListView({collection:new GhReposCollection()});
					var userListView = new UserListView({collection:new GhUsersCollection()});
			}
			else{
				$().getGhUsers($('#inputUserName').val(), 
					function(users){
						var reposListView = new RepoListView({collection:[]});
						//var reposListView = new RepoListView({collection:new GhReposCollection()});
						var userListView = new UserListView({collection:users});
					});
			}

		}//end if
	},//end clicked fcn

	initialize : function(){
		this.render();
	},

	render : function(){
		return this;//facilitate chaining
	},
});


/***************************************************************************/
var UserView = Backbone.View.extend({
	tagName:"li", 

	events:{
		"click .user-view-item":"userSelected",
	},

	userSelected : function(event){
		$().getGhRepos($('#inputUserName').val(), 
			function(repos){
				var repoListView = new RepoListView({collection:repos});
			});
		
	},

	template: _.template("<li class='user-view-item'><%= login %> (public repos: <%= public_repos %>, followers: <%= followers %>, following: <%= following %> )</li>"),

	errorTemplate: _.template("<li>Error: <%= message %></li>"),

	initialize:function(){
		this.render();
	},

	render:function(){
		var data = this.model.toJSON();
		if (data.hasError){
			this.$el.html(this.errorTemplate(data));
		}
		else{
			this.$el.html(this.template(data));
		}
		return this;//facilitate chaining
	},

});//end UserView

/***************************************************************************/
var UserListView = Backbone.View.extend({
	el:"#userList",
	
	template : _.template("<li><%= xyz %></li>"),
	
	initialize : function(){
		this.render();
		},
	
	render: function(){	
		if (this.collection.length > 0){
			this.$el.html("");
			$("#userListArea").show();
			this.collection.each(function(user){
				var aUserView = new UserView({model: user});
				this.$el.append(aUserView.render().el);
			}, this);
		}	
		else{
			$("#userListArea").hide();
		}
		return this;//facilitate chaining
	},
});//end UserListView

/***************************************************************************/
var RepoView = Backbone.View.extend({
	tagName:"li", 

	template: _.template("<li><%= name %></li>"),

	initialize:function(){
		this.render();
	},

	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;//facilitate chaining
	},

});//end UserView

/***************************************************************************/
var RepoListView = Backbone.View.extend({
	el:"#repoList",

	initialize : function(){
		this.render();
	},

	render : function(){
		if (this.collection.length > 0){
			this.$el.html("");
			$("#repoListArea").show();
			this.collection.each(function(repo){
				var aRepoView = new RepoView({model: repo});
				this.$el.append(aRepoView.render().el);
			}, this);
		}	
		else{
			$("#repoListArea").hide();
		}
		return this;//facilitate chaining
	},
});

/***************************************************************************
	jQuery plugin to grab GitHub users
	partialName = partial user name to search on
	callBack = callback function that takes in a parameter of type, GhUsersCollection

	TODO: 
		--put this in its own js file
		--grab url from config file.
		--research cross-domain issue.

	WARNING: this does not seem to work on mobile due to cross-domain issues. 
***************************************************************************/
$.fn.getGhUsers = function(partialName, callBack){
	$.ajax({
			url:'http://localhost:3000/api/user?q=' + partialName,
				type: 'GET',  
        contentType: "application/jsonp",
        async: true,
        //dataType: 'jsonp',
        //crossDomain: true,			
        success : function(data){
									callBack(new GhUsersCollection(data));
			}
		});

};

/***************************************************************************
	jQuery plugin to grab GitHub repos
	userName = user name for which to get repos
	callBack = callback function that takes in a parameter of type, GhReposCollection

	TODO: 
		--put this in its own js file
		--grab url from config file.
***************************************************************************/
$.fn.getGhRepos = function(userName, callBack){
	$.getJSON(
			'http://localhost:3000/api/repos?q=' + userName, function(data){
			callBack(new GhReposCollection(data));
			}
		);
};


/***************************************************************************/
$(document).ready(function(){

	var userListView = new UserListView({collection:new GhUsersCollection()});
	var reposListView = new RepoListView({collection:new GhReposCollection()});
	var mainView = new MainView();


});