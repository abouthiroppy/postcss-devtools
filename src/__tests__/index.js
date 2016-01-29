import ava from 'ava';
import postcss from 'postcss';
import plugin from '../';
import {name} from '../../package.json';

const fixture = 'h1{color:blue}';

let backgroundify = postcss.plugin('backgroundify', () => {
    return css => {
        css.walkDecls(decl => decl.prop = 'background');
    };
});

let redify = postcss.plugin('redify', () => {
    return css => {
        return new Promise(resolve => {
            setTimeout(function () {
                css.walkDecls(decl => decl.value = 'red');
                return resolve();
            }, 50);
        });
    };
});

ava('should not print anything if no plugins', t => {
    return postcss([plugin()]).process(fixture).then(result => {
        t.same(result.messages.length, 0);
    });
});

ava('should work with sync plugins', t => {
    let processors = [
        plugin({silent: true}),
        backgroundify
    ];
    
    return postcss(processors).process(fixture).then(result => {
        t.same(result.messages.length, 1);
    });
});

ava('should work with async plugins', t => {
    let processors = [
        plugin({silent: true}),
        redify()
    ];
    
    return postcss(processors).process(fixture).then(result => {
        t.same(result.messages.length, 1);
    });
});

ava('should print different colours for the slower plugins', t => {
    let processors = [
        plugin(),
        redify(),
        redify(),
        redify(),
        redify(),
        backgroundify(),
        backgroundify(),
        backgroundify(),
        backgroundify(),
        backgroundify(),
        backgroundify()
    ];
    
    return postcss(processors).process(fixture).then(result => {
        t.same(result.messages.length, 10);
    });
});

ava('should work with filenames', t => {
    let processors = [
        plugin(),
        backgroundify
    ];
    
    return postcss(processors).process(fixture, {from: 'app.css'}).then(result => {
        t.same(result.messages.length, 1);
    });
});

ava('should use the postcss plugin api', t => {
    t.ok(plugin().postcssVersion, 'should be able to access version');
    t.same(plugin().postcssPlugin, name, 'should be able to access name');
});