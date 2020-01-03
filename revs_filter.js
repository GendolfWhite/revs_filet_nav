$(function(){

	$_revs = {
		_all_revs: true, // Выводить все отзывы без фильтра.
		_revs_cat: null, // Имя категории
		_revs_page_num: 1, // Номер текущей страницы. *
		_revs_page_count: 1, // Кол-во страниц.
		_revs_show_count: 6, // Сколько блоков выводить на 1 страницу. *
		_revs_tag: 'review-box', // Тег блока.
		_revs_block: null, // Все блоки (jQuery).
		_revs_block_info: [], // Информация по всем блокам.

		_parent: '#revs', // После какого блока будет добавлять навигацию и сообщение "not found".
		_notFound: null,
		_nav: null,
		_nav_a: '#revs_nav > .wrap > a',

		_sort_a: '#revsort > .wrap > a',
		_sort_a_for_div: '#revsort > .wrap > div > div > a',
		_sort_name_id: null, // ID категории сортировки отзывов. **
		_sort_but_id: 1, // Номер кнопки которая подсвечивается.

		// * Используется только при _all_revs == true.
		// ** Используется только при _all_revs == false.

		init(){
			this._revs_block = $(this._revs_tag);
			this.setPageCount();

			this.normalizeCatsData();

			this.createNav();
			this.createNotFound();
			this.showRevs();
			this.events();
			this.getOpts();
		},

		// Функция вывода информации в консаль 
		//###// Техническая функция //###//
		pre($data){
			console.info($data);
		},

		// Нормализация данных о категории в блоках
		normalizeCatsData(){
			let $self = this;
			this._revs_block.each(function(){
				$id = $(this).attr('data-rev-id');
				$cats = $(this).attr('data-rev-cats').replace(/ \/ /g, '#').replace(/  /g, '').replace(/ #/g, '#');
				$self._revs_block_info[$id] = {id: $id, cats: $cats};
			});
		},

		// Устанавливаем кол-во страниц для навигации по страницам
		setPageCount(){
			this._revs_page_count = Math.ceil(this._revs_block.length / this._revs_show_count);
		},

		// Прячем все блоки  с отзывами
		hideRevs(){
			// .fadeOut(400)
			this._revs_block.removeClass('show');
			this._notFound.removeClass('show');
		},

		// Отображаем блоки с отзывами
		showRevs(){
			this.hideRevs();
			if(this._all_revs){
				this._nav.fadeIn(300);
				this.show_all_revs();
			}else{
				this._nav.fadeOut(300);
				this.show_filtered_revs();
			}
		},

		// Функция вывода всех блоков без фильтрации
		show_all_revs(){
			let $i = 0;
			let $finish_i = this._revs_page_num * this._revs_show_count;
			let $start_i = $finish_i - this._revs_show_count;
			this._revs_block.each(function(){
				if($i >= $start_i && $i < $finish_i)
					// .fadeIn(400)
					$(this).addClass('show');
				$i++;
			});
		},


		// Фильтруем и показываем нужные блоки
		show_filtered_revs(){
			let $self = this;
			let $cat = this._revs_cat;
			let $i = 0;
			this._revs_block_info.forEach(function(item, i, arr){
				if(item.cats.indexOf($cat) !== -1){
					$($self._revs_tag+'[data-rev-id="'+item.id+'"]').addClass('show');
					$i++;
				}
			});

			if($i == 0)
				this._notFound.addClass('show');
		},

		// Создаем навигацию по страницам
		createNav(){
			let $nav = "<section id='revs_nav'><div class='wrap flex'>";
			for(let $i = 1; $i <= this._revs_page_count; $i++)
				$nav += "<a href='#'"+(($i == this._revs_page_num) ? " class='this'" : '')+" data-revs-page-num='"+$i+"'>"+$i+"</a>";

			$nav += "</div></section>";
			$(this._parent).after($nav);
			this._nav = $('#revs_nav'); 
		},

		createNotFound(){
			let $notfound = "<section id='notfound'><div class='wrap'><h2>Ничего не найдено</h2></div></section>";
			$(this._parent).after($notfound);
			this._notFound = $('#notfound');
		},

		// Функция открытия конкретной страницы
		openPage($page){
			this.hideRevs();
			this._revs_page_num = $page;
			this.show_all_revs();
		},

		// Прокручиваем до начала контента с блоками
		slideToRevsBox(){
			$('html, body').animate({
				'scrollTop': $(this._parent).offset().top+'px',
			}, 400);
		},

		// функция для переустановки класса this у управляющих элементов.
		resetThis(){
			if(this._all_revs){
				$(this._nav_a).removeClass('this');
				$(this._nav_a+"[data-revs-page-num='"+this._revs_page_num+"']").addClass('this');
			}else{
				$(this._sort_a).removeClass('this');
				$(this._sort_a+"[data-cat-id='"+this._sort_but_id+"']").addClass('this');
				$(this._sort_a_for_div).removeClass('this');
				$(this._sort_a_for_div+="[data-cat-name-id='"+this._sort_name_id+"']").addClass('this');
			}
		},

		// Функция проверки сохранённых данных для отображения нужных блоков.
		getOpts(){
			if(window.location.hash != ''){
				let $opts = window.location.hash.replace('#','').split('&');
				let $n_opts = [];
				$opts.forEach(function(item, i, arr){
					item = item.split('=');
					$n_opts[item[0]] = item[1];
				}); // Да-да.. Я в курсе что в таком случае длинна массива в консоле будет = 0.. 

				$opts = $n_opts;
				this._all_revs = eval($opts['_all_revs']);
				this._revs_page_num = parseInt($opts['_revs_page_num']);
				this._sort_but_id = parseInt($opts['_sort_but_id']);
				this._sort_name_id = eval($opts['_sort_name_id']);
				if(this._sort_name_id !== null){
					this._revs_cat = $(this._sort_a_for_div+="[data-cat-name-id='"+this._sort_name_id+"']").text();
				}

				this.resetThis();
				this.showRevs();
			}
		},

		// Записываем данные в адресную строку для возвращения по истории окна к нужным данным.
		saveOptsToUrl(){
			let $opts = '#';
			$opts += '_all_revs='+this._all_revs;
			$opts += '&_revs_page_num='+this._revs_page_num;
			$opts += '&_sort_name_id='+this._sort_name_id;
			$opts += '&_sort_but_id='+this._sort_but_id;
			window.history.pushState(null, null, $opts);
			this.pre($opts);
		},

		// Вешаем ивенты на кнопки
		events(){
			let $self = this;
			$(document).on('click', this._nav_a, function(){
				$self.E_nav_a($(this));
				$self.saveOptsToUrl();
				return false;
			});
			
			$(document).on('click', this._sort_a, function(){
				$self.E_sort_a($(this));
				$self.saveOptsToUrl();
				return false;
			});

			$(document).on('click', this._sort_a_for_div, function(){
				$self.E_sort_a_for_div($(this));
				$self.saveOptsToUrl();
				return false;
			});

		},

		// Ивенты для кнопок в навигации
		E_nav_a($a){
			if(!$a.hasClass('this')){
				$(this._nav_a).removeClass('this');
				$a.addClass('this');
				this.openPage($a.text());
			}
			this.slideToRevsBox();
		},

		// Ивент для кнопок сортировки
		E_sort_a($a){
			let $cat_id = parseInt($a.attr('data-cat-id'));
			this._sort_but_id = $cat_id;
			let $drop_menu = false;
			let $other_drop_menu = false;
			if($cat_id !== 0){
				$drop_menu = $a.siblings('div').find('div#cat'+$cat_id);
				$other_drop_menu = $drop_menu.siblings('div');
			}else{
				$a.siblings('div').find('div').fadeOut(200);
				this._all_revs = true;
				this._revs_cat = null;
				$(this._sort_a).removeClass('this');
				$(this._sort_a_for_div).removeClass('this');
				$a.addClass('this');
				this.showRevs();
			}

			$(this._sort_a).removeClass('br');
			if($drop_menu){
				if($drop_menu.css('display') == 'none'){
					$other_drop_menu.fadeOut(200);
					setTimeout(function(){
						$drop_menu.fadeIn(400);
						$a.addClass('br');
					}, 200);
				}else{
					$drop_menu.fadeOut(400);
					$a.removeClass('br');
				}
			}
		},

		// Ивент для категорий сортировки
		E_sort_a_for_div($a){
			let $id = $a.attr('data-cat-name-id');
			let $drop_menu = $a.parent('div');

			if(!$a.hasClass('this')){
				$sort_but_id = $drop_menu.attr('id').replace('cat', '');
				this._sort_name_id = $id;
				$(this._sort_a_for_div).removeClass('this');
				$a.addClass('this');
				$(this._sort_a).removeClass('this');
				$(this._sort_a+'[data-cat-id='+$sort_but_id+']').addClass('this');

				this._all_revs = false;
				this._revs_cat = $a.text();
				this.showRevs();
			}
		},
	};

	$_revs.init();

});