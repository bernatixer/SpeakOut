$(document).ready(function(){
		
	$('#speakout').click(choose_room);
	$('#speakout_00').click(public);
	$('#speakout_01').click(private);

	$('#reselect-room').click(reselectroom);

});

function choose_room(){

	$('#speakout').fadeOut( '100' , function(){
		$('#speakout').addClass('hidden');
		$('#choose_room').removeClass('hidden');
		
	} );
	
}

function public(){
	console.log('public');
	$('#choose_room').fadeOut('200',function(){
		$('#choose_room').addClass('hidden');
		$('#p_room').removeClass('hidden');

		$('#reselect-room').removeClass('hidden');
		$('#reselect-room').fadeIn('200');
	});
}

function private(){
	console.log('private');
	$('#choose_room').fadeOut('200',function(){
		$('#choose_room').addClass('hidden');
		$('#pr_room').removeClass('hidden');

		$('#reselect-room').removeClass('hidden');
		$('#reselect-room').fadeIn('200');
	});
}

function reselectroom(){

	$('#reselect-room').fadeOut('100',function(){
		$('#pr_room').addClass('hidden');
		$('#p_room').addClass('hidden');

		$('#choose_room').removeClass('hidden');

		$('#choose_room').fadeIn('200');

		
	});
	
	
}

function get_url() {

	$('#pr_room').fadeOut('100',function() {
		$('#pr_room').addClass('hidden');
		$('#reselect-room').addClass('hidden');
        $('#p_room').removeClass('hidden');
	});
}