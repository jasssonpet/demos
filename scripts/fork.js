(function() {
    var username = location.hostname.split('.')[0]

      , parts = location.pathname.match(/\/(.+?)\/(.+)/)

      , repo = parts[1]
      , folder = parts[2]

      , source = 'https://github.com/' + username + '/' + repo +'/tree/gh-pages/' + folder

    document.write('<a href="' + source + '"><img style="position: absolute; top: 0; right: 0; border: 0;"' +
        ' src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png" alt="Fork me on GitHub"></a>')
}())
