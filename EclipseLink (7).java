package eclipsesmp;

import org.bukkit.Bukkit;
import org.bukkit.Statistic;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitTask;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Pattern;

public final class EclipseLink extends JavaPlugin {
  private final HttpClient client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();
  private String base,secret,moneyPlaceholder,shardsPlaceholder;
  private BukkitTask task;
  private static final Pattern CODE=Pattern.compile("[0-9]{6}");
  @Override public void onEnable(){
    saveDefaultConfig();base=getConfig().getString("backend-url","").replaceAll("/+$","");secret=getConfig().getString("secret","");
    moneyPlaceholder=getConfig().getString("money-placeholder","");shardsPlaceholder=getConfig().getString("shards-placeholder","");
    if(!base.startsWith("https://")||secret.length()<32||secret.startsWith("REPLACE")){
      getLogger().warning("Configure backend-url and a long secret in plugins/EclipseLink/config.yml");return;
    }
    long period=Math.max(30,getConfig().getInt("stats-interval-seconds",60))*20L;
    task=Bukkit.getScheduler().runTaskTimer(this,this::pushStats,period,period);
  }
  @Override public void onDisable(){if(task!=null)task.cancel();}
  @Override public boolean onCommand(CommandSender sender,Command command,String label,String[] args){
    if(command.getName().equalsIgnoreCase("eclipsesync")){
      sender.sendMessage("EclipseLink: "+(secret.length()>31&&!secret.startsWith("REPLACE")?"configure":"configuration incomplete")+" ; placeholders money/shards "+(moneyPlaceholder.isBlank()||shardsPlaceholder.isBlank()?"a configurer":"configures"));return true;
    }
    if(!(sender instanceof Player player)){sender.sendMessage("Commande joueur uniquement.");return true;}
    if(args.length!=1||!CODE.matcher(args[0]).matches()){player.sendMessage("Utilisation : /link <code a 6 chiffres>");return true;}
    if(secret.length()<32||secret.startsWith("REPLACE")){player.sendMessage("Liaison non configuree.");return true;}
    player.sendMessage("Verification de ton code...");
    String json="{\"code\":\""+args[0]+"\",\"uuid\":\""+player.getUniqueId()+"\",\"username\":\""+player.getName()+"\"}";
    HttpRequest r=HttpRequest.newBuilder(URI.create(base+"/api/minecraft/link/claim")).timeout(Duration.ofSeconds(12))
      .header("Content-Type","application/json").header("x-eclipse-secret",secret).POST(HttpRequest.BodyPublishers.ofString(json)).build();
    client.sendAsync(r,HttpResponse.BodyHandlers.ofString()).whenComplete((resp,err)->{
      Bukkit.getScheduler().runTask(this,()->{
        if(!player.isOnline())return;
        if(err!=null){player.sendMessage("Erreur de connexion au site.");getLogger().warning(err.toString());}
        else if(resp.statusCode()==200)player.sendMessage("Compte Minecraft lie a EclipseSMP !");
        else player.sendMessage("Code incorrect, expire ou compte deja lie (HTTP "+resp.statusCode()+").");
      });
    });return true;
  }
  private Double placeholderNumber(Player p,String format){
    if(format.isBlank()||!Bukkit.getPluginManager().isPluginEnabled("PlaceholderAPI"))return null;
    try {
      String value=me.clip.placeholderapi.PlaceholderAPI.setPlaceholders(p,format).replace(" ","").replace(",","").replace("$","");
      double n=Double.parseDouble(value);return Double.isFinite(n)&&n>=0?n:null;
    }catch(Exception e){return null;}
  }
  private void pushStats(){
    if(moneyPlaceholder.isBlank()||shardsPlaceholder.isBlank())return; // Never invent Money or Shards.
    if(!Bukkit.getPluginManager().isPluginEnabled("PlaceholderAPI"))return;
    List<String> stats=new ArrayList<>();
    for(Player p:Bukkit.getOnlinePlayers()){
      Double money=placeholderNumber(p,moneyPlaceholder),shards=placeholderNumber(p,shardsPlaceholder);
      if(money==null||shards==null)continue;
      // Data is collected on Minecraft's main thread. HTTP runs asynchronously.
      stats.add("{\"uuid\":\""+p.getUniqueId()+"\",\"username\":\""+p.getName()+"\",\"rank_name\":\"default\",\"money\":"+money+",\"shards\":"+shards.longValue()+",\"kills\":"+p.getStatistic(Statistic.PLAYER_KILLS)+",\"deaths\":"+p.getStatistic(Statistic.DEATHS)+",\"playtime_seconds\":"+(p.getStatistic(Statistic.PLAY_ONE_MINUTE)/20)+"}");
    }
    if(stats.isEmpty())return;
    String json="{\"players\":["+String.join(",",stats)+"]}";
    HttpRequest r=HttpRequest.newBuilder(URI.create(base+"/api/minecraft/stats")).timeout(Duration.ofSeconds(15)).header("Content-Type","application/json").header("x-eclipse-secret",secret).POST(HttpRequest.BodyPublishers.ofString(json)).build();
    client.sendAsync(r,HttpResponse.BodyHandlers.ofString()).thenAccept(resp->{if(resp.statusCode()!=200)getLogger().warning("Stats sync HTTP "+resp.statusCode());}).exceptionally(err->{getLogger().warning("Stats sync error: "+err);return null;});
  }
}
